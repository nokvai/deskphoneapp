const { remote } = require('electron')
const min = document.querySelector('.min')
const max = document.querySelector('.max')
const unmax = document.querySelector('.unmax')
const x = document.querySelector('.x')

min.addEventListener('click', () => {
    var win = remote.BrowserWindow.getFocusedWindow();
    win.minimize();
})

max.addEventListener('click', () => {
    setMaximized(true);
})

unmax.addEventListener('click',() => {
    setMaximized(false);
})

x.addEventListener('click', () => {
    var win = remote.BrowserWindow.getFocusedWindow();
    win.hide();
    win.close();
})

function setMaximized(b) {
  const bounds = remote.screen.getPrimaryDisplay().bounds;
  var number = bounds.height;
  var percentToGet = 10;
  var percentAsDecimal = (percentToGet / 100);
  var percent = percentAsDecimal * number; 
  //var height = Math.round(number - percent); 
  if (b) {
    // TMP.maximized = true; 
    var win = remote.BrowserWindow.getFocusedWindow();
    // win.maximize();
    
    win.setSize(bounds.width, bounds.height);
    win.center();
    win.maximize();  
    unmax.style.display = 'inline';
    max.style.display = 'none';
  } else {
    // TMP.maximized = false;
    var win = remote.BrowserWindow.getFocusedWindow();
    // win.unmaximize(); 
    win.setSize(440,750); 
    max.style.display = 'inline';
    unmax.style.display = 'none';
  }
}

const webview_app1 = document.querySelector('#webview1')
const webview_app2 = document.querySelector('#webview2')
const webview_app3 = document.querySelector('#webview3')

$(webview_app2).css({'display': 'none'})
$(webview_app3).css({'display': 'none'})

webview_app1.addEventListener('dom-ready', ()=> { })
webview_app1.addEventListener('did-stop-loading', () => { 
  const Store = require('./store.js');
  const store = new Store({ configName: 'user-preferences', defaults: { theme: 'Default' } });
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

    //webview_app1.openDevTools()
    try { 
      webview_app1.getWebContents().executeJavaScript(`document.querySelector('.login-message').style.display = 'none';
        document.querySelector('#login-container').style['background-color'] = '#fff';
        document.querySelector('#login-box').style['box-shadow'] = 'none';
        document.querySelector('#login-box').style['-webkit-box-shadow'] = 'none';
        document.querySelector('#login-fields').style.display = 'none';
        document.querySelector('#login-submit').style.display = 'none';
        document.querySelector('#reset-container').style.display = 'none';
        document.querySelector('#ssoSeparator').style.display = 'none';
        document.querySelector('.sso-container').style.display = 'none';
        document.querySelector('.new-user-container').style.display = 'none';`);
    
    } catch (error) { console.log(error); }
 
    webview_app1.send("request-apps");
  
    webview_app2.loadURL('https://login.monstervoip.com/portal/attendant');
    webview_app3.loadURL('https://login.monstervoip.com/video/');
});

// webview_app2.addEventListener('did-stop-loading', () => {
//     try {
//       webview_app2.getWebContents().executeJavaScript(`document.querySelector('.login-message').style.display = 'none';
//         document.querySelector('#login-container').style['background-color'] = '#fff';
//         document.querySelector('#login-box').style['box-shadow'] = 'none';
//         document.querySelector('#login-box').style['-webkit-box-shadow'] = 'none';
//         document.querySelector('#login-fields').style.display = 'none';
//         document.querySelector('#login-submit').style.display = 'none';
//         document.querySelector('#reset-container').style.display = 'none';
//         document.querySelector('#ssoSeparator').style.display = 'none';
//         document.querySelector('.sso-container').style.display = 'none';
//         document.querySelector('.new-user-container').style.display = 'none';`);
//     } catch (error) { console.log(error); }
// })

// webview_app3.addEventListener('did-stop-loading', () => { 
//     try { 
//         webview_app3.getWebContents().executeJavaScript(`document.querySelector('.login-message').style.display = 'none';
//           document.querySelector('#login-container').style['background-color'] = '#fff';
//           document.querySelector('#login-box').style['box-shadow'] = 'none';
//           document.querySelector('#login-box').style['-webkit-box-shadow'] = 'none';
//           document.querySelector('#login-fields').style.display = 'none';
//           document.querySelector('#login-submit').style.display = 'none';
//           document.querySelector('#reset-container').style.display = 'none';
//           document.querySelector('#ssoSeparator').style.display = 'none';
//           document.querySelector('.sso-container').style.display = 'none';
//           document.querySelector('.new-user-container').style.display = 'none';`);
//     } catch (error) { console.log(error); }
// })

$('#btnPortal').click(()=> {
  $(webview_app1).css({'display': 'inline-flex' })
  $(webview_app2).css({'display': 'none'})
  $(webview_app3).css({'display': 'none'})
})

$('#btnAttendant').click(()=> {
  $(webview_app1).css({'display': 'none'})
  $(webview_app2).css({'display': 'inline-flex' })
  $(webview_app3).css({'display': 'none'})
})

$('#btnMeeting').click(()=> {
  $(webview_app1).css({'display': 'none'})
  $(webview_app2).css({'display': 'none'})
  $(webview_app3).css({'display': 'inline-flex' })
})
