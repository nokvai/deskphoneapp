const { app, BrowserWindow, Tray, Menu, nativeImage, session } = require('electron');
const path = require('path');
const url = require('url');

const { autoUpdater } = require('electron-updater');
const logger = require('electron-log');
const isDev = require('electron-is-dev');
 
let mainWindow = null;
let winAbout = null;
let winAutoUpdate = null;
let tray = null 
let is_alwaysontop = false;

if (require('electron-squirrel-startup')) {
    app.quit();
}
 
const createNotificationTray = (win) => { 
  app.whenReady().then(() => {
    if (tray != null) return;
    // tray = new Tray(path.join(__dirname, 'icon32x32.png'))
    let image_option = {width: 16, height: 16, quality: 'best'};
    let image = nativeImage.createFromPath(path.join(__dirname, 'icon32x32.png')).resize(image_option);
    tray = new Tray(image)
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show', click() { win.show() } },
      { label: 'Hide', click() { win.hide() } },
      { label: 'About', click() { 
             winAbout = null; 
            if (winAbout == null) {
              //const remote  = require('electron').remote; 
              //const BrowserWindow = remote.BrowserWindow;
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
                      // webSecurity: false,
                      // enableRemoteModule: true,
                      webviewTag: true, 
                    },
                    // frame: false,
                    // transparent: true,
                    // movable: true,
                    // maximizable: false,
                })
              } else if (theme == 'Rounded-Border') {
                winAbout = new BrowserWindow({
                      height: 400,
                      width: 400,
                      webPreferences: {
                        nodeIntegration: true,
                        // webSecurity: false,
                        // enableRemoteModule: true,
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
              // winCallFlow.webContents.openDevTools() // show portal dev tool 
              // winAbout.on("close", (evt) => {
              //   evt.preventDefault();
                
              //   winAbout.close();
               
              // }); 
              // winAbout.maximize();
              //win.focus();
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
    })
  })
};

const createWindow = () => { 

/**
   * Autoupdater events
   */

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
    if (winAutoUpdate == null) {
      const BrowserWindow = remote.BrowserWindow;
      winAutoUpdate = new BrowserWindow({
          webPreferences: {
              nodeIntegration: true,
              // webSecurity: false,
              // enableRemoteModule: true,
              //webviewTag: true, 
          },
          width: 400,
          height: 120,
          alwaysOnTop: true,
          resizable: false,
          frame: false,
          transparent: true,
          movable: true,
          maximizable: false,
      });
      
      winAutoUpdate.setIcon(path.join(__dirname, 'MonsterVoip.png'))
      winAutoUpdate.setMenu(null)
      winAutoUpdate.loadURL(url.format({
      pathname: path.join(__dirname, 'autoupdate.html'),
          protocol: 'file:'
      }));
      //winAutoUpdate.webContents.openDevTools() // show winAutoUpdate dev tool 
      winAutoUpdate.on("close", (evt) => {
          evt.preventDefault();
          winAutoUpdate = null;
      });

      winAutoUpdate.webContents.send('update-data', store);
  }
    /* Notify user about ready to be installed update */
        // let image_option = {width: 16, height: 16, quality: 'best'};
        // let image = nativeImage.createFromPath(path.join(__dirname, 'MonsterVoip.png')).resize(image_option);
        // if (process.platform == 'win32') { 
        // console.log("Windows Notification")
        // const WindowsToaster = require('node-notifier').WindowsToaster; 
        // var notifierWindows = new WindowsToaster({
        //     withFallback: false, // Fallback to Growl or Balloons?
        //     customPath: void 0 // Relative/Absolute path if you want to use your fork of SnoreToast.exe
        // });  
        // notifierWindows.notify({
        //     message: "Click to Update Desktop Phone",
        //     title: "Monster VoIP Desktop Phone - New Update is Available.",
        //     icon : image,
        //     sound: true, // Only Notification Center or Windows Toasters
        //     wait: true // Wait with callback, until user action is taken against notification
        //     }, function (err, response) {
        //         console.log(err, response);
        //         if(response =='activate') { 
        //           autoUpdater.quitAndInstall();
        //         }
        //     }); 
        //     notifierWindows.on('click', function (notifierObject, options) { 
        //         autoUpdater.quitAndInstall();
        //     }); 
        //     notifierWindows.on('timeout', function (notifierObject, options) { });

        // } else if (process.platform == 'darwin') {
        //     // Mac OS 
        //     console.log("Mac Notification Center")
        //     const NotificationCenter = require('node-notifier').NotificationCenter;
        //     var notifierMac = new NotificationCenter({
        //     withFallback: false, // Use Growl Fallback if <= 10.8
        //     customPath: undefined // Relative/Absolute path to binary if you want to use your own fork of terminal-notifier
        //     });
        //     notifierMac.notify({
        //         message: "Click to Update Desktop Phone",
        //         title: "Monster VoIP Desktop Phone - New Update is Available.",
        //         icon : image,
        //         subtitle: undefined,
        //         sound: false, // Case Sensitive string for location of sound file, or use one of macOS' native sounds (see below)
        //         contentImage: undefined, // Absolute Path to Attached Image (Content Image)
        //         open: undefined, // URL to open on Click
        //         wait: false, // Wait for User Action against Notification or times out. Same as timeout = 5 seconds
        //         // New in latest version. See `example/macInput.js` for usage
        //         // timeout: 5, // Takes precedence over wait if both are defined.
        //         closeLabel: undefined, // String. Label for cancel button
        //         actions: undefined, // String | Array<String>. Action label or list of labels in case of dropdown
        //         dropdownLabel: undefined, // String. Label to be used if multiple actions
        //         reply: false // Boolean. If notification should take input. Value passed as third argument in callback and event emitter.
        //     },
        //     function (err, response) {
        //         console.log(err, response); 
        //         if(response =='activate') { 
        //           autoUpdater.quitAndInstall();
        //         }
        //     });  
        //     notifierMac.on('click', function (notifierObject, options) {
        //         autoUpdater.quitAndInstall();
        //     }); 
        //     notifierMac.on('timeout', function (notifierObject, options) { }); 
        // } 
        /* Notify user about ready to be installed update */
  });



  /* Check for updates manually */
  //autoUpdater.checkForUpdates();
 
   // Trigger update check
   if (!isDev) { 
   /* Check updates every 1 minute */
      setInterval(() => {
        // autoUpdater.checkForUpdates();
        autoUpdater.checkForUpdatesAndNotify();
      }, 60000); // 3,600,000 - 1 hour, 180,000 - 3 minutes
   }
 
    const Store = require('./store.js');
    const store = new Store({ configName: 'user-preferences',
        defaults: {
          theme: 'Default',
          alwaysontop: false,
        }
    });
    if( store.get('theme') == undefined) {
      store.set('theme', 'Default')
    }
    let theme = store.get('theme');
    if (theme == null) {  store.set('theme', 'Default'); theme = 'Default'  }

    if( store.get('alwaysontop') == undefined) { 
      store.set('alwaysontop', false)
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
            },
            // frame: false,
            // transparent: true,
            // movable: true,
            // maximizable: false,
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
 
  mainWindow.setMenu(null)

  let image_option = {width: 16, height: 16, quality: 'best'};
  let image = nativeImage.createFromPath(path.join(__dirname, 'MonsterVoip.png')).resize(image_option);
  mainWindow.setIcon(image);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
 
  // mainWindow.webContents.openDevTools() // main tools console 

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

  const { nativeTheme } = require('electron')
  nativeTheme.shouldUseDarkColors = true;
  nativeTheme.themeSource = 'dark';

  store.set('autosignin_used', false)

    session.fromPartition("default").setPermissionRequestHandler((webContents, permission, callback) => {
      let allowedPermissions = ["audioCapture"]; // Full list here: https://developer.chrome.com/extensions/declare_permissions#manifest
    
      if (allowedPermissions.includes(permission)) {
          callback(true); // Approve permission request
      } else {
          console.error(
              `The application tried to request permission for '${permission}'. This permission was not whitelisted and has been blocked.`
          );
    
          callback(false); // Deny
      }
    });
 
};
 
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // Create myWindow, load the rest of the app, etc...
  app.on('ready', createWindow);
}

app.setAppUserModelId("Monster VoIP Desktop Phone")
// app.setAppUserModelId(process.execPath)

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




