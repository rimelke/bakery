import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'
import electronReload from 'electron-reload'
import { initHandlers } from './handlers'
import isDev from 'electron-is-dev'
import unhandled from 'electron-unhandled'
import runCommand from './prisma/runCommand'
import prisma from './prisma'
import fs from 'fs'
import fsp from 'fs/promises'
import Store from 'electron-store'
import { promisify } from 'util'
import { pipeline } from 'stream'

const asyncPipe = promisify(pipeline)

unhandled()

electronReload(__dirname, {})

const dbPath = isDev
  ? path.resolve(__dirname, '..', '..', 'prisma', 'dev.db')
  : path.resolve(app.getPath('userData'), 'data.db')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: path.resolve(__dirname, '..', '..', 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'preload.js')
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
      await asyncPipe(
        fs.createReadStream(dbPath),
        fs.createWriteStream(backupPath)
      )
      await asyncPipe(
        fs.createReadStream(path.resolve(app.getPath('userData'), 'notes.txt')),
        fs.createWriteStream(
          path.resolve(path.dirname(backupPath), 'notes.txt')
        )
      )
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

const runMigrations = async () => {
  const fileExists = fs.existsSync(dbPath)

  if (fileExists) {
    const runnedMigrations: any[] =
      await prisma.$queryRaw`SELECT * FROM "_prisma_migrations"`

    const migrationsDir = path.resolve(
      app.getAppPath().replace('app.asar', 'app.asar.unpacked'),
      'prisma',
      'migrations'
    )

    console.log('migrationsDir', migrationsDir)

    const files = await fsp.readdir(migrationsDir)

    files.pop()
    files.splice(0, runnedMigrations.length)

    if (files.length === 0) return
  } else fs.closeSync(fs.openSync(dbPath, 'w'))

  const schemaPath = path.resolve(
    app.getAppPath().replace('app.asar', 'app.asar.unpacked'),
    'prisma',
    'schema.prisma'
  )

  console.log('schemaPath', schemaPath)

  await runCommand({
    command: ['migrate', 'deploy', '--schema', schemaPath],
    dbUrl: `file:${dbPath}`
  })
}

const main = async () => {
  if (!isDev) await runMigrations()

  createWindow()
}

app.whenReady().then(main)
