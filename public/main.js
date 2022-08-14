const { app, BrowserWindow } = require("electron");

const main = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL("http://localhost:3000");
  win.once("ready-to-show", win.show);
};

app.whenReady().then(main);
