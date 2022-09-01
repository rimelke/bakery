import { app, BrowserWindow } from 'electron'
import path from 'path'
import electronReload from 'electron-reload'
import { initHandlers } from './handlers'

electronReload(__dirname, {})

const main = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'preload.js')
    }
  })

  console.log(app.getPath('userData'))

  win.loadURL('http://localhost:3000')
  win.once('ready-to-show', win.show)

  initHandlers()
}

app.whenReady().then(main)
