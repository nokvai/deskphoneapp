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
  var height = Math.round(number - percent); 
  if (b) { 
    var win = remote.BrowserWindow.getFocusedWindow(); 
    win.setSize(bounds.width, bounds.height);
    win.center();
    win.maximize();
    unmax.style.display = 'inline';
    max.style.display = 'none';
  } else { 
    var win = remote.BrowserWindow.getFocusedWindow(); 
    win.setSize(440,750); 
    max.style.display = 'inline';
    unmax.style.display = 'none';
  }
}

const webview_meeting = document.querySelector('#webview2')

webview_meeting.addEventListener('dom-ready', ()=> {
    
})
webview_meeting.addEventListener('did-stop-loading', () => {
 
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

    // let theme = store.get('theme')
    // if (theme == 'Default') {
    //   $('.titlebar').hide()
    //   $('.card-style').css({'border': 'none', 'box-shadow': 'none'})
    // } else if (theme == 'Rounded-Border') { 
    //   $('.titlebar').show()
    //   $('.card-style').css({'border': '1.2px solid rgba(171, 181, 184, 1)', 'box-shadow': '0px 1px 4px 0px rgba(85,95,99,0.2)'})
    // }

    //  webview_meeting.openDevTools()
    // try { 
       

    //   webview_meeting.getWebContents().executeJavaScript(`
    //   let $ = require('jquery');
    //   var x = $('.react-flex-item')[0];
    //       var y = $(x).find('div:first-child');
    //       y.css({
    //           'height': '372px',
    //           'padding': '0px 25px',
    //           'background-image': 'none',
    //           'background-size': 'cover'
    //     })
    //     var img = $('<img />').attr('src', 'https://login.monstervoip.com/ns-api/?object=image&action=read&server=login.monstervoip.com&filename=portal_landing.png')
    //     img.css({
    //       'margin': '20%'
    //     })
    //     y.append(img)

    //     $("div[class$='_subTitle']").hide();
    //     var un = $("div[class$='_userInput']")//.css({ 'background-color': 'red' })
    //     un.find('label').hide();
    //     un.find('input').hide();
    //     un.find('hr').hide();
    //     var ps = $("div[class$='_passInput']");
    //     ps.find('label').hide();
    //     ps.find('input').hide();
    //     ps.find('hr').hide();`);

    // } catch (error) {  console.log(error); }
 
    webview_meeting.send("request-meeting");
});

// let $ = require('jquery');

// $('#txtMeetingId').on('keyup', () => {
//     if ($(this).val().length >= 7) {
//       $('#btnOpenMeeting').show()
//     } else {
//       $('#btnOpenMeeting').hide();
//     }
// })

// var minLength = 7;
// var maxLength = 100;

// $(document).ready(function(){
//   $('#txtMeetingId').on('keydown keyup change', function(){
//     $('#btnOpenMeeting').text('Join Meeting');
//       var char = $(this).val();
//       var charLength = $(this).val().length;
//       if(charLength < minLength){
//           $('small').text('Meeting ID required (Length is short, minimum '+minLength+' required).').css({'color': 'red'});
//           $('#btnOpenMeeting').hide();
//       } else if(charLength > maxLength){
//           $('small').text('Meeting ID required (Length is not valid, maximum '+maxLength+' allowed).').css({'color': 'red'});
//           $(this).val(char.substring(0, maxLength));
//           $('#btnOpenMeeting').hide();
//       } else {
//           $('small').text('Meeting ID Ok (Length is valid).').css({'color': 'green'});
//           $('#btnOpenMeeting').show();
//       }
//   });
// });

// $('#btnGenerateMeetingId').click(()=> {
//   let rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
//   $('#txtMeetingId').val(rand)
//   $('#txtMeetingId').trigger('change');
//   $('#btnOpenMeeting').text('Create New Meeting');
// })


// $('#btnOpenMeeting').click(()=> {
//     const Store = require('./store.js');
//     const store = new Store({
//       configName: 'user-preferences',
//       defaults: { 
//       }
//     }); 
//     let { username } = store.get('credentials')
//     if (username != "") {
//           var identity = username.split("@");
//           var user = identity[0];
//           var meeting_id = $('#txtMeetingId').val();
//           require("electron").shell.openExternal('https://login.monstervoip.com/video/?user='+ user +'&id=' + meeting_id );
//           setTimeout(()=> {
//             // var win = remote.BrowserWindow.getFocusedWindow();
//             // win.close();
//             window.close()
//           }, 5000)
//     }
   
//   })