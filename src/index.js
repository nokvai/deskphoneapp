const { app, BrowserWindow, Tray, Menu, nativeImage, session, remote } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
const logger = require('electron-log');
const isDev = require('electron-is-dev');
 
global.mainWindow = null;
let winAbout = null;
let winAutoUpdate = null;
let tray = null;
let is_alwaysontop = false;
let checkupdate_cnt = 0;

if (require('electron-squirrel-startup')) {
    app.quit();
}
 
const createNotificationTray = (win) => { 
  app.whenReady().then(() => {
    if (tray != null) return;
    let image_option = {width: 16, height: 16, quality: 'best'};
    let image = nativeImage.createFromPath(path.join(__dirname, 'icon32x32.png')).resize(image_option);
    tray = new Tray(image)
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show', click() { win.show() } },
      { label: 'Hide', click() { win.hide() } },
      { label: 'About', click() { 
             winAbout = null; 
            if (winAbout == null) {
              const path = require('path');  
              const Store = require('./store.js');
              const store = new Store({ configName: 'user-preferences',
                defaults: {
                  theme: 'Default',
                }
              });
              if ( store.get('theme') == undefined) {
                store.set('theme', 'Default')
              }
              let theme = store.get('theme');
              if (theme == null || theme == "") { theme = 'Default' }
              if (theme == 'Default') {
                winAbout = new BrowserWindow({
                    height: 400,
                    width: 400,
                    webPreferences: {
                      nodeIntegration: true,
                      webviewTag: true, 
                    },
                  
                })
              } else if (theme == 'Rounded-Border') {
                winAbout = new BrowserWindow({
                      height: 400,
                      width: 400,
                      webPreferences: {
                        nodeIntegration: true,
                        webviewTag: true, 
                      },
                      frame: false,
                      transparent: true,
                      movable: true,
                      maximizable: false,
                  })
              }

              winAbout.setIcon(path.join(__dirname, 'MonsterVoip.png'))
              winAbout.setMenu(null) 
              winAbout.loadURL(url.format({
                pathname: path.join(__dirname, 'about.html'),
                protocol: 'file:'
              }));
          }

        } 
      },
      { type:'separator' },
      { label: 'Restart', click() {  
        app.relaunch();
        app.exit(0);} 
      },
      { label: 'Exit', click() { win.destroy(); app.quit(); } }
    ])
    tray.setToolTip('MonsterVoIP Desktop Phone')
    tray.setContextMenu(contextMenu)
    tray.addListener('click', ()=> {
      if (win.isVisible()) {
        win.hide()
      } else {
        win.show()
      }
    });
  });
};


const { ipcMain } = require('electron')
ipcMain.on('autoupdate-message', (event, arg) => {
    // console.log(arg);
    // event.reply('autoupdate-message-reply', 'updated')
    if (arg == "updatenow") {
        autoUpdater.quitAndInstall();
    } else if( arg == "delay") {
        checkupdate_cnt++;
    }
});

const createWindow = () => { 
 
  autoUpdater.on('checking-for-update', () => {
    logger.log('Checking for update');
  });

  autoUpdater.on('error', (error) => {
    logger.error('Error while checking for updates', error);
  });

  autoUpdater.on('update-available', (updateInfo) => {
    logger.log('Update is available:', updateInfo);
  });

  autoUpdater.on('update-not-available', (updateInfo) => {
    logger.log('No updates are available', updateInfo);
  });

  autoUpdater.on('download-progress', (progressInfo) => {
    let logMessage = `speed ${progressInfo.bytesPerSecond} b/s; progress ${progressInfo.percent}%; downloaded ${progressInfo.transferred} out of ${progressInfo.total} bytes`;
    logger.log(logMessage);
  });

  autoUpdater.on('update-downloaded', (updateInfo) => {
      logger.log('Update is ready', updateInfo);
      showAutoUpdateDialog();
  });

  if (!isDev) {
      setInterval(() => { 
        //autoUpdater.checkForUpdatesAndNotify();
        if (!checkupdate_cnt > 0) {
          autoUpdater.checkForUpdates();
        }
      }, 60000); // 1 minute
  }

  //showAutoUpdateDialog();

  function showAutoUpdateDialog() {
    if (winAutoUpdate == null) {
       // const BrowserWindow = remote.BrowserWindow;
        winAutoUpdate = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            width: 400,
            height: 200,
            alwaysOnTop: false,
            resizable: false,
            frame: false,
            transparent: true,
            movable: true,
            maximizable: false,
        });
        
        winAutoUpdate.setIcon(path.join(__dirname, 'MonsterVoip.png'));
        winAutoUpdate.setMenu(null);
        winAutoUpdate.loadURL(url.format({
        pathname: path.join(__dirname, 'autoupdate.html'),
            protocol: 'file:'
        }));
        //winAutoUpdate.webContents.openDevTools() // show winAutoUpdate dev tool 
        winAutoUpdate.on("close", (evt) => {
            winAutoUpdate = null;
            //console.log('winAutoUpdate: ', winAutoUpdate);
        });
    }
  }
 
    const Store = require('./store.js');
    const store = new Store({ configName: 'user-preferences',
        defaults: {
          theme: 'Default',
          alwaysontop: false,
        }
    });
    if( store.get('theme') == undefined) {
      store.set('theme', 'Default');
    }
    let theme = store.get('theme');
    if (theme == null) {  store.set('theme', 'Default'); theme = 'Default';  }

    if( store.get('alwaysontop') == undefined) { 
      store.set('alwaysontop', false);
      is_alwaysontop = false;
    }
    is_alwaysontop = store.get('alwaysontop');

    if (theme == 'Default') {
        mainWindow = new BrowserWindow({
            width: 440,
            height: 750, 
            minWidth: 440,
            minHeight: 750,
            alwaysOnTop: is_alwaysontop,
            title: 'Monster VoIP Desktop Phone',
            webPreferences: {
              nodeIntegration: true,
              nodeIntegrationInWorker: true,
              webSecurity: false,
              enableRemoteModule: true,
              webviewTag: true, 
            }
        });
    } else if (theme == 'Rounded-Border') {
        mainWindow = new BrowserWindow({
            width: 440,
            height: 750, 
            minWidth: 440,
            minHeight: 750,
            alwaysOnTop: is_alwaysontop,
            title: 'Monster VoIP Desktop Phone',
            webPreferences: {
              nodeIntegration: true,
              nodeIntegrationInWorker: true,
              webSecurity: false,
              enableRemoteModule: true,
              webviewTag: true, 
            },
            frame: false,
            transparent: true,
            movable: true,
            maximizable: false,
        });
    }
 
  mainWindow.setMenu(null);

  let image_option = {width: 16, height: 16, quality: 'best'};
  let image = nativeImage.createFromPath(path.join(__dirname, 'MonsterVoip.png')).resize(image_option);
  mainWindow.setIcon(image);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
 
  // mainWindow.webContents.openDevTools(); // main tools console 

  mainWindow.webContents.on('did-finish-load', function(e) { });

  mainWindow.webContents.on('dom-ready', function(e) { })
 
  mainWindow.on("close", (evt) => {
      evt.preventDefault(); 
      mainWindow.hide()
  });

  mainWindow.on('unmaximize',function(event){
    event.preventDefault();
    mainWindow.setSize(440, 750);  
  });
 
  createNotificationTray(mainWindow);

  const { nativeTheme } = require('electron');
  nativeTheme.shouldUseDarkColors = true;
  nativeTheme.themeSource = 'dark';

  store.set('autosignin_used', false);

  session.fromPartition("default").setPermissionRequestHandler((webContents, permission, callback) => {
      let allowedPermissions = ["audioCapture"];
      if (allowedPermissions.includes(permission)) {
          callback(true);
      } else {
          console.error(`The application tried to request permission for '${permission}'. This permission was not whitelisted and has been blocked.`); 
          callback(false);
      }
  });
 
};
 
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
  });
  app.on('ready', createWindow);
}

app.setAppUserModelId("Monster VoIP Desktop Phone");

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});




