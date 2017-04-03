const url = require('url')
    , path = require('path')
    , { app, BrowserWindow } = require('electron')

let mainWindow

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 800, height: 800 });

  const page = url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  })

  mainWindow.loadURL(page);

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
})

app.on('window-all-closed', () => {
  app.quit();
})
