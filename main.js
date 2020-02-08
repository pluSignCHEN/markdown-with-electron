const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.maximize()
    const urlLocaltion = isDev ? 'http://localhost:3000' : 'url'
    mainWindow.loadURL(urlLocaltion)
    mainWindow.show()
    mainWindow.webContents.openDevTools()
})