const {app, BrowserWindow, Notification,ipcMain, ipcRenderer} = require('electron')
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

const path = require('path')
const url = require('url')
const AuthWindow = require('./auth');

//Logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win =  new BrowserWindow({width: 1120, height: 700, frame: false, minHeight: 610, minWidth: 850});

  //win.webContents.openDevTools()

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  }))


  win.on('closed', () => {
    win = null
  })
}

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

global.openLoginServer = function(server_name, callback){
  AuthWindow.startRequest(win, function(access_token, err) {
    callback(err, access_token);
  });
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Buscando actualizaciones...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Actualización disponible');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Ya tienes la última versión.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error al actualizar.');
})
autoUpdater.on('download-progress', (progressObj) => {
  let speed = ((progressObj.bytesPerSecond / 1000) / 1000).toFixed(1);
  let transferred = ((progressObj.transferred / 1000) / 1000).toFixed(1);
  let total = ((progressObj.total / 1000) / 1000).toFixed(1);
  let percent = progressObj.percent.toFixed(1);

  let log_message = "Download speed: " + speed + " Mb/s";
  log_message = log_message + ' - Downloaded: ' + percent + '%';
  log_message = log_message + ' (' + transferred + "/" + total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Actualización descargada, se instalará en 5 segundos.');
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  },5000)
})

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});