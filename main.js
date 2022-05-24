const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const ipc = ipcMain;



function createWindow() {
  const win = new BrowserWindow({
    transparent: true,
    frame: false,
    resizable: false,
    width: 500,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  ipc.on('kapat', () => { win.close() })
  win.loadFile('girisEkrani.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


