const webview = document.querySelector('webview')
const url = require('url')
const { remote, BrowserWindow } = require('electron')
var win = remote.BrowserWindow.getFocusedWindow()
let winPortal = null;
let winMeeting = null;
let winCallFlow = null;
let winAutosignin = null;
let winSettings = null;
let winApps = null;

function setMaximized(b) {
  const bounds = remote.screen.getPrimaryDisplay().bounds;
  var number = bounds.height;
  var percentToGet = 10;
  var percentAsDecimal = (percentToGet / 100);
  var percent = percentAsDecimal * number;
  // var height = Math.round(number - percent); 
  if (b) {
    win.setSize(bounds.width, bounds.height);
    win.center();
    win.maximize();  
    $('.unmax').show();
    $('.max').hide();
  } else {
   win.setSize(440, 750);
   $('.max').show();
   $('.unmax').hide();
  }
}

var wX = -0;
var wY = -0;
var dragging = false;

$('.titlebar > div').mousedown(function(e){
    dragging = true;
    wX = e.pageX;
    wY = e.pageY;
});

$(window).mousemove(function(e){
    if(dragging){
      window.moveTo(e.screenX-wX, e.screenY-wY);
    }
});

$(window).mouseup(function(){
    dragging = false;
});

webview.addEventListener('dom-ready', () => { })

webview.addEventListener('did-finish-load', () => { })
 
webview.addEventListener('did-start-loading', () => { })

webview.addEventListener('did-stop-loading', () => {
   
  try {
      webview.getWebContents().executeJavaScript(`
      document.querySelector('.nets-login-container').style['background-color'] = '#fff';
      document.querySelector('div[class="text-center m-t-10 font-14"]').style.display = 'none';
      document.querySelector('form[name="loginForm"]').style.display = 'none';
      document.querySelector('form[name="googleSsoForm"]').style.display = 'none';
      document.querySelector('form[name="officeSsoForm"]').style.display = 'none';
      document.querySelector('md-card').style['box-shadow'] = 'none';
      document.querySelector('md-card').style['-webkit-box-shadow'] = 'none';`);
     
    
  } catch (error) {  console.log(error); }

    $('#btnSignin').show();
    //webview.openDevTools() // open dev tool for webview 

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
    if (theme == 'Default') { 
      $('.titlebar').hide()
      $('.card-style').css({'border': 'none', 'box-shadow': 'none'})
    } else if (theme == 'Rounded-Border') { 
      $('.titlebar').show()
      $('.card-style').css({'border': '1.2px solid rgba(171, 181, 184, 1)', 'box-shadow': '0px 1px 4px 0px rgba(85,95,99,0.2)'})
    } 

    if (store.get('credentials') == undefined) {
      let username = "", password = "";
      store.set('credentials', { username, password });
    }
    
    let { username, password } = store.get('credentials')
  
    if ((username == "" && password == "") || (username == null && password == null)) {
      createBrowserWindowSettings(true);
    }
  
 
    console.log("DOM-Ready, triggering events !");
    webview.send("request");
    
});

$('#btnSignin').click((e) => {
  e.preventDefault();
  let text = $('#btnSignin').text();
    if (text == "Sign In") {
        const Store = require('./store.js');
        const store = new Store({ configName: 'user-preferences' });
        let { username, password } = store.get('credentials'); 
        webview.send("send-to-webphone", {"signin": {user_name: username, pass_word: password}});
    } else if (text == "Sign Out") {
        try { 
          winPortal = null;
          winMeeting = null;
          winCallFlow = null;
        } catch (error) { }
        webview.send("send-to-webphone", {"signout": {}});
    }
});

$('#btnSettings').click((e) => {
  e.preventDefault()
  createBrowserWindowSettings(false);
});

$('#btnMeetings').click((e) => {
  e.preventDefault()
  const Store = require('./store.js');
  const store = new Store({ configName: 'user-preferences' });
  let { username, password } = store.get('credentials');
  webview.send("send-to-webphone", {"meeting": {user_name: username, pass_word: password}});
})
 
$('#btnPortal').click(() => { 
  const Store = require('./store.js');
  const store = new Store({ configName: 'user-preferences' });
  let { username, password } = store.get('credentials');
  webview.send("send-to-webphone", {"portal": {user_name: username, pass_word: password}});
});

$('#btnCallFlow').click(() => { 
  const Store = require('./store.js');
  const store = new Store({ configName: 'user-preferences' });
  let { username, password } = store.get('credentials');
  webview.send("send-to-webphone", {"callflow": {user_name: username, pass_word: password}});
});

$('#btnApps').click(() => { 
  const Store = require('./store.js');
  const store = new Store({ configName: 'user-preferences' });
  let { username, password } = store.get('credentials');
  // var identity = username.split("@");
  // var user = identity[0]; 
  // var domain = identity[1];
  
  // const axios = require('axios')
  // axios.get('https://api.monstervoip.com/api/mvapi/stream/' + domain + '/' + user, {}).then(response => {
  //     let allow = false;
  //     if (response.data['activated'] == 1) {
  //         allow = true;
  //         var todayDate = new Date();
  //         axios.get('https://api.monstervoip.com/api/mvapi/stream/serverdatetime', {})
  //         .then(response => {
  //             todayDate = new Date( response.data);
  //             console.log('serverdatetime: ', todayDate);
  //         })
  //         var dateOne = Date.parse(response.data['expiry_date']);
  //         if (todayDate >= dateOne) { 
  //             allow = false;
  //             alert("Subscription Already Expired.")
  //             remote.app.exit(0);
  //         }
  //         if (response.data['subscription_type'] == 'Standard') {
  //             allow = false;
  //             alert("You're in Standard Package, desktop app not included.")
  //             remote.app.exit(0);
  //         }
  //     } else {
  //         allow = false;
  //         alert("Desktop app not activated.")
  //         remote.app.exit(0);
  //     }
  //     if (allow) {
        webview.send("send-to-webphone", {"apps": {user_name: username, pass_word: password}});
  //     } 
  // }).catch(error => { console.log(error); });

});

function createBrowserWindowSettings(is_startup) {
  if (winSettings == null) {
      const remote  = require('electron').remote; 
      const BrowserWindow = remote.BrowserWindow;
      const path = require('path');
      const Store = require('./store.js');
      const store = new Store({ configName: 'user-preferences',
          defaults: {
            theme: 'Default',
          }
      });
      if( store.get('theme') == undefined) {
        store.set('theme', 'Default')
      }
      let theme = store.get('theme');
      if (theme == null || theme == "") { theme = 'Default' }
      if (theme == 'Default') {
        winSettings = new BrowserWindow({
           // height: 550,
            height: 450,
            width: 400,
            title: 'Monster VoIP Desktop Phone',
            alwaysOnTop: true,
            webPreferences: {
              nodeIntegration: true,
              nodeIntegrationInWorker: false,
              webSecurity: false,
              enableRemoteModule: true,
            },
            //resizable: false,
            // frame: false,
            // transparent: true,
            // movable: true,
        });
      } else if (theme == 'Rounded-Border') {
          winSettings = new BrowserWindow({
              // height: 550,
              height: 450,
              width: 400,
              title: 'Monster VoIP Desktop Phone',
              alwaysOnTop: true,
              webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: false,
                webSecurity: false,
                enableRemoteModule: true,
              },
              //resizable: false,
              frame: false,
              transparent: true,
              movable: true,
          });
      }
 
      winSettings.setMaximizable(false)
      winSettings.setMenu(null)
      winSettings.setIcon(path.join(__dirname, 'MonsterVoip.png'));
      winSettings.loadURL(url.format({
        pathname: path.join(__dirname, 'settings/settings.html'),
        protocol: 'file:'
      }));
      winSettings.on("close", (evt) => {
        evt.preventDefault(); 
          if ($('#btnSignin').text() == "Sign In") {
            const Store = require('./store.js');
            const store = new Store({  configName: 'user-preferences'});
            let { username, password } = store.get('credentials')
            let autosignin_used = store.get('autosignin_used')
            
            // var identity = username.split("@");
            // var user = identity[0]; 
            // var domain = identity[1];
            // const axios = require('axios')
            // axios.get('https://api.monstervoip.com/api/mvapi/stream/' + domain + '/' + user, {}).then(response => {
            //     let allow = false;
            //     if (response.data['activated'] == 1) {
            //         allow = true;
            //         var todayDate = new Date();
            //         axios.get('https://api.monstervoip.com/api/mvapi/stream/serverdatetime', {})
            //         .then(response => {
            //             todayDate = new Date( response.data);
            //             console.log('serverdatetime: ', todayDate);
            //         })
            //         var dateOne = Date.parse(response.data['expiry_date']);
            //         if (todayDate >= dateOne) { 
            //             allow = false;
            //             alert("Subscription Already Expired.")
            //             remote.app.exit(0);
            //         }
            //         if (response.data['subscription_type'] == 'Standard') {
            //             allow = false;
            //             alert("You're in Standard Package, desktop app not included.")
            //             remote.app.exit(0);
            //         }
            //     } else {
            //         allow = false;
            //         alert("Desktop app not activated.")
            //         remote.app.exit(0);
            //     }
            //     if (allow) {
                    if (is_startup == true && (username.length > 0 && password.length > 0) && autosignin_used == false) {
                      const BrowserWindow = remote.BrowserWindow;
                      winAutosignin = new BrowserWindow({
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
                      })
                    
                      winAutosignin.setIcon(path.join(__dirname, 'MonsterVoip.png'))
                      winAutosignin.setMenu(null) 
                      winAutosignin.loadURL(url.format({
                      pathname: path.join(__dirname, 'autosignin.html'),
                      protocol: 'file:'
                      })); 
                      //winAutosignin.webContents.openDevTools() // show winAutosignin dev tool 
                      winAutosignin.on("close", (evt) => {
                        evt.preventDefault();
                        winAutosignin = null;
                      });
                      $('#btnSignin').trigger('click')
    
                      store.set('autosignin_used', true)
                    }
            //     } 
            // }).catch(error => { console.log(error); });
 
          }
        winSettings = null;
      });
        // winSettings.webContents.openDevTools() // tools for settings
  }
}
 
webview.addEventListener('ipc-message', (event, data) => {
  let bounce = event.channel;
  if (bounce == "signedin") {
      if ( $('#btnSignin').text() == 'Sign In') {
          $('.unmax').show();
          $('.max').hide();
      }
      $('#btnSignin').text('Sign Out').removeClass('btn-primary').addClass('btn-danger');
     
      // navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      navigator.mediaDevices.getUserMedia({ audio: true})
      .then(function(stream) {
          console.log('You let me use your mic!')
      })
      .catch(function(err) {
          console.log('No mic for you!')
      });

    } else if (bounce == "signout") {
      setTimeout(()=> {
        $('#btnSignin').text('Sign In').removeClass('btn-danger').addClass('btn-primary');
        // setMaximized(false); 
      }, 3000);
 
    } else if (bounce == "portal_ok") { 
        if (winPortal == null) {
            const remote  = require('electron').remote; 
            const BrowserWindow = remote.BrowserWindow;
            const path = require('path');  
            const Store = require('./store.js');
            const store = new Store({ configName: 'user-preferences',
                defaults: {
                  theme: 'Default',
                }
            });
            if( store.get('theme') == undefined) {
              store.set('theme', 'Default')
            }
            let theme = store.get('theme');
            if (theme == null || theme == "") { theme = 'Default' }
            if (theme == 'Default') {
              winPortal = new BrowserWindow({
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
                winPortal = new BrowserWindow({
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
 
            winPortal.setIcon(path.join(__dirname, 'MonsterVoip.png'))
            winPortal.setMenu(null) 
            winPortal.loadURL(url.format({
              pathname: path.join(__dirname, 'portal.html'),
              protocol: 'file:'
            })); 
            // winPortal.webContents.openDevTools() // show portal dev tool 
            winPortal.on("close", (evt) => {
              evt.preventDefault();
              winPortal = null;
            }); 
            winPortal.maximize();
            win.focus();
        }
    } else if (bounce == "portal_failed") {
        winPortal = null;
    } else if (bounce == "callflow_ok") { 
          if (winCallFlow == null) {
              const remote  = require('electron').remote; 
              const BrowserWindow = remote.BrowserWindow;
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
                winCallFlow = new BrowserWindow({
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
                winCallFlow = new BrowserWindow({
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
 
              winCallFlow.setIcon(path.join(__dirname, 'MonsterVoip.png'))
              winCallFlow.setMenu(null) 
              winCallFlow.loadURL(url.format({
                pathname: path.join(__dirname, 'callflow.html'),
                protocol: 'file:'
              })); 
              // winCallFlow.webContents.openDevTools() // show portal dev tool 
              winCallFlow.on("close", (evt) => {
                evt.preventDefault();
               
                winCallFlow = null;
              }); 
              winCallFlow.maximize();
              win.focus();
          }
      } else if (bounce == "callflow_failed") {
           
          winCallFlow = null;
      } else if (bounce == "meeting_ok") {
        if (winMeeting == null) {
            const remote  = require('electron').remote; 
            const BrowserWindow = remote.BrowserWindow;
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
              winMeeting = new BrowserWindow({
                  // alwaysOnTop: true,
                  // width: 440,
                  // height: 250, 
                  // minWidth: 440,
                  // minHeight: 300,
                  webPreferences: {
                      nodeIntegration: true,
                      webSecurity: false,
                      // enableRemoteModule: true,
                      webviewTag: true, 
                  },
                  resizable: true
                  // frame: false,
                  // transparent: true,
                  // movable: true,
                  // maximizable: false,
              })
            } else if (theme == 'Rounded-Border') {
                winMeeting = new BrowserWindow({
                    // alwaysOnTop: true,
                    // width: 440,
                    // height: 250, 
                    // minWidth: 440,
                    // minHeight: 300,
                    webPreferences: {
                        nodeIntegration: true,
                        webSecurity: false,
                        // enableRemoteModule: true,
                        webviewTag: true, 
                    },
                    resizable: true,
                    frame: false,
                    transparent: true,
                    movable: true,
                    maximizable: false,
                })
            }

            winMeeting.webContents.session.setPreloads([path.join(__dirname, 'preload-get-display-media-polyfill.js')])
            // winMeeting.webContents.session.setPermissionCheckHandler(async (webContents, permission, details) => {
            //   return true
            // })
            // winMeeting.webContents.session.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
            //   callback(true)
            // })
 
            winMeeting.setIcon(path.join(__dirname, 'MonsterVoip.png'))
            winMeeting.setMenu(null) 
            winMeeting.loadURL(url.format({
              pathname: path.join(__dirname, 'meeting.html'),
              protocol: 'file:'
            }));  
              // winMeeting.webContents.openDevTools() // show meeting dev tool 
            winMeeting.on("close", (evt) => {
              evt.preventDefault(); 
              winMeeting = null;
            }); 
            winMeeting.maximize();
            win.focus();
        }
    } else if (bounce == "metting_failed") { 
        winMeeting = null;
    } else if (bounce == "apps_ok") { 
          if (winApps == null) {
              const remote  = require('electron').remote; 
              const BrowserWindow = remote.BrowserWindow;
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
                winApps = new BrowserWindow({
                    webPreferences: {
                      nodeIntegration: true,
                      webSecurity: false,
                      // enableRemoteModule: true,
                      webviewTag: true, 
                    },
                    // frame: false,
                    // transparent: true,
                    // movable: true,
                    // maximizable: false,
                })
              } else if (theme == 'Rounded-Border') {
                winApps = new BrowserWindow({
                      webPreferences: {
                        nodeIntegration: true,
                        webSecurity: false,
                        // enableRemoteModule: true,
                        webviewTag: true, 
                      },
                      frame: false,
                      transparent: true,
                      movable: true,
                      maximizable: false,
                  })
              }

              winApps.webContents.session.setPreloads([path.join(__dirname, 'preload-get-display-media-polyfill.js')])
              // winApps.webContents.session.setPermissionCheckHandler(async (webContents, permission, details) => {
              //   return true
              // })
              // winApps.webContents.session.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
              //   callback(true)
              // })

              const { Menu} = require('electron').remote;
              var menu = Menu.buildFromTemplate([
                {
                    label: 'Apps',
                        submenu: [
                          {
                            label:'PBX Portal',
                            click() { 
                              winApps.webContents.executeJavaScript('$("#btnPortal").trigger("click");')
                            } 
                          },
                          {
                            label:'Attendant Console',
                            click() { 
                              winApps.webContents.executeJavaScript('$("#btnAttendant").trigger("click");')
                            } 
                          },
                          {
                            label:'Meetings',
                            click() { 
                              winApps.webContents.executeJavaScript('$("#btnMeeting").trigger("click");')
                            } 
                          },
                      ]
                }
              ])
              //winApps.setMenu(null) 
              winApps.setMenu(menu) 
              winApps.setIcon(path.join(__dirname, 'MonsterVoip.png'))
              winApps.webContents.setWebRTCIPHandlingPolicy('default')
              winApps.loadURL(url.format({
                pathname: path.join(__dirname, 'apps.html'),
                protocol: 'file:'
              })); 
              // winApps.webContents.openDevTools() // show portal dev tool 
              winApps.on("close", (evt) => {
                evt.preventDefault();
              
                winApps = null;
              }); 
              winApps.maximize();
              win.focus();
          }
      } else if (bounce == "apps_failed") {
          winApps = null;
      }
    
});

$('.min').click(()=> { win.minimize(); })

$('.max').click(()=> { setMaximized(true); })

$('.unmax').click(()=> { setMaximized(false); })

$('.x').click(()=> {  
    win.hide();
    win.close();
})