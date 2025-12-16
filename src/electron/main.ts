import 'dotenv/config'

import { execFile } from 'child_process'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import electronReload from 'electron-reload'
import Store from 'electron-store'
import unhandled from 'electron-unhandled'
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'

import { db, dbPath } from '../db'
import { uploadToS3 } from './aws'
import { initHandlers } from './handlers'

const asyncPipe = promisify(pipeline)

unhandled()

electronReload(__dirname, {})

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: path.resolve(__dirname, '..', '..', 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  win.removeMenu()
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.resolve(__dirname, '..', 'index.html')}`
  )
  win.once('ready-to-show', () => {
    win.maximize()
    win.show()

    if (isDev) win.webContents.openDevTools()
  })

  ipcMain.on('isDev', (e) => (e.returnValue = isDev))
  ipcMain.on('userDataPath', (e) => (e.returnValue = app.getPath('userData')))
  ipcMain.on(
    'dialog:getBackupPath',
    (e) =>
      (e.returnValue = dialog.showSaveDialogSync({
        title: 'Salvar backup',
        defaultPath: 'backup.db'
      }))
  )
  ipcMain.handle('makeBackup', async (_, backupPath: string) => {
    try {
      await new Promise((resolve, reject) => {
        execFile('sqlite3', [dbPath, `.backup '${backupPath}'`], (error) => {
          if (error) {
            reject(error)
          } else {
            resolve({ success: true, file: backupPath })
          }
        })
      })

      const notesBackupPath = path.resolve(
        path.dirname(backupPath),
        'notes.txt'
      )

      await asyncPipe(
        fs.createReadStream(path.resolve(app.getPath('userData'), 'notes.txt')),
        fs.createWriteStream(notesBackupPath)
      )

      const day = new Date().getDate()

      await uploadToS3(backupPath, `backups/${day}/backup.db`)
      await uploadToS3(notesBackupPath, `backups/${day}/notes.txt`)
    } catch (err) {
      console.error(err)
    }
  })
  ipcMain.on('getNotes', (e) => {
    try {
      e.returnValue = fs.readFileSync(
        path.resolve(app.getPath('userData'), 'notes.txt'),
        'utf-8'
      )
    } catch (err) {
      e.returnValue = ''
    }
  })
  ipcMain.handle('saveNotes', async (_, data: string) => {
    await fsp.writeFile(
      path.resolve(app.getPath('userData'), 'notes.txt'),
      data
    )
  })
  initHandlers()
  Store.initRenderer()
}

const runMigrations = () => {
  const migrationsFolder = path.resolve(
    app.getAppPath().replace('app.asar', 'app.asar.unpacked'),
    'drizzle'
  )

  db.run('PRAGMA journal_mode=WAL')

  migrate(db, {
    migrationsFolder
  })
}

const main = () => {
  runMigrations()
  createWindow()
}

app.whenReady().then(main)
