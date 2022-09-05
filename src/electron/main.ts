import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import electronReload from 'electron-reload'
import { initHandlers } from './handlers'
import isDev from 'electron-is-dev'
import unhandled from 'electron-unhandled'
import runCommand from './prisma/runCommand'
import prisma from './prisma'
import fs from 'fs'
import fsp from 'fs/promises'

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
  })

  ipcMain.on('isDev', (e) => (e.returnValue = isDev))
  ipcMain.on('userDataPath', (e) => (e.returnValue = app.getPath('userData')))
  initHandlers()
}

const runMigrations = async () => {
  const dbPath = path.resolve(app.getPath('userData'), 'data.db')

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
