const { app, BrowserWindow } = require('electron')
const path = require('path')

const main = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'fon.js')
    }
  })

  console.log(app.getPath('userData'))

  win.loadURL('http://localhost:3000')
  win.once('ready-to-show', win.show)
}

app.whenReady().then(main)
