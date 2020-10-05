const { remote } = require('electron')

// var TMP = { maximized: false }

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
  var height = Math.round(number - percent); 
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

const webview_portal = document.querySelector('#webview1')

webview_portal.addEventListener('dom-ready', ()=> {
    
})
webview_portal.addEventListener('did-stop-loading', () => {
 
    const Store = require('./store.js');
    const store = new Store({
      configName: 'user-preferences',
      defaults: { 
      }
    });

    // let theme = store.get('theme')
    // const titlebar = document.querySelector('.titlebar')
    // const cardStyle = document.querySelector('.card-style')
    // if (theme == 'Default') { 
    //     titlebar.style.display = 'none';
    //     cardStyle.style.border = 'none';
    //     cardStyle.style.boxShadow = 'none'; 
    // } else if (theme == 'Rounded-Border') {
    //     titlebar.style.display = 'inline';
    //     cardStyle.style.border = '1.2px solid rgba(171, 181, 184, 1)';
    //     cardStyle.style.boxShadow = '0px 1px 4px 0px rgba(85,95,99,0.2)'; 
    // }

    let theme = store.get('theme')
    if (theme == 'Default') { 
      $('.titlebar').hide()
      $('.card-style').css({'border': 'none', 'box-shadow': 'none'})
    } else if (theme == 'Rounded-Border') { 
      $('.titlebar').show()
      $('.card-style').css({'border': '1.2px solid rgba(171, 181, 184, 1)', 'box-shadow': '0px 1px 4px 0px rgba(85,95,99,0.2)'})
    }

    //webview_portal.openDevTools()
    try { 
        webview_portal.getWebContents().executeJavaScript(`document.querySelector('.login-message').style.display = 'none';
        document.querySelector('#login-container').style['background-color'] = '#fff';
        document.querySelector('#login-box').style['box-shadow'] = 'none';
        document.querySelector('#login-box').style['-webkit-box-shadow'] = 'none';
        document.querySelector('#login-fields').style.display = 'none';
        document.querySelector('#login-submit').style.display = 'none';
        document.querySelector('#reset-container').style.display = 'none';
        document.querySelector('.new-user-container').style.display = 'none';`);
    
    } catch (error) { console.log(error); }

  
    webview_portal.send("request-portal");
});