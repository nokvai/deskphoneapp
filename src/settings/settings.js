const Store = require('../store.js');
const store = new Store({
  configName: 'user-preferences',
  defaults: { 
      credentials: { username: '', password: '' }, 
      onstartup: false,
      autosignin: false,
      alwaysontop: false,
      sound: { microphone: '', speaker: '' },
      theme: 'Default',
  }
});
var AutoLaunch = require('auto-launch');
const { remote, ipcRenderer, app } = require('electron')
const { dialog } = require('electron').remote;
let alwaysontopcheckchanged = false;

$(document).ready(()=> {

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        return;
    }

    let themes = ['Default', 'Rounded-Border'];
    themes.forEach(function(thm) { 
        let opt = $('<option />'); 
        opt.attr("value", thm);
        opt.attr("label", thm);
        $('#theme').append(opt);
    })
    
    //List cameras and microphones.
    let inputlist = $('#inputmedialist');
    let outputlist = $('#outputmedialist');
    inputlist.change(()=> { 
    //    var device_id = inputlist.children("option:selected").val();
    //    // alert(device_id)
    //     document.querySelector("audio").setSinkId(device_id);
        // navigator.webkitGetUserMedia({ audio: true })
    })

    navigator.mediaDevices.enumerateDevices().then(function(devices) {
        devices.forEach(function(device) { 
            let opt = $('<option />'); 
            opt.attr("value", device.deviceId);
            opt.attr("label", device.label);
            if (device.kind == 'audioinput') {
                inputlist.append(opt);
            } else if (device.kind == 'audiooutput') {
                outputlist.append(opt);
            }
        })
    }).catch(function(err) {
        console.log(err.name + ": " + err.message);
    });
 
    $(function () {
        $('[data-toggle="password"]').each(function () {
            var input = $(this);
            var eye_btn = $(this).parent().find('.input-group-text');
            eye_btn.css('cursor', 'pointer').addClass('input-password-hide');
            eye_btn.on('click', function () {
                if (eye_btn.hasClass('input-password-hide')) {
                    eye_btn.removeClass('input-password-hide').addClass('input-password-show');
                    eye_btn.find('.fa').removeClass('fa-eye').addClass('fa-eye-slash')
                    input.attr('type', 'text');
                } else {
                    eye_btn.removeClass('input-password-show').addClass('input-password-hide');
                    eye_btn.find('.fa').removeClass('fa-eye-slash').addClass('fa-eye')
                    input.attr('type', 'password');
                }
            });
        });
    });

    if( store.get('theme') == undefined) {
        store.set('theme', 'Default')
    }
    let theme = store.get('theme')
    if (theme == null) { theme = 'Default' }
    if (theme == 'Default') { 
      $('.titlebar').hide()
      $('.card-style').css({'border': 'none', 'box-shadow': 'none'})
    } else if (theme == 'Rounded-Border') { 
      $('.titlebar').show()
      $('.card-style').css({'border': '1.2px solid rgba(171, 181, 184, 1)', 'box-shadow': '0px 1px 4px 0px rgba(85,95,99,0.2)'})
    }

    let { username, password } =  store.get('credentials')
    $('#username').val(username);
    $("#password").val(password);
    $('#checkStartup').prop('checked', store.get('onstartup'));
    $('#checkAutoSignin').prop('checked', store.get('autosignin'));
    $('#checkAlwaysOnTop').prop('checked', store.get('alwaysontop'));

    if (store.get('sound') == undefined) {
        let mic = inputlist.children("option:first").val();
        let spkr = outputlist.children("option:first").val();
        store.set('sound', { microphone: mic, speaker: spkr  }); 
    }

    let { microphone, speaker } =  store.get('sound')
    // alert(microphone + "\n" + speaker); 
    setTimeout(()=> {
        $('#inputmedialist').val(microphone).trigger('change');
       
    }, 100)

    setTimeout(()=> {
        $('#outputmedialist').val(speaker).trigger('change');
    }, 100)

    setTimeout(()=> {
        $('#theme').val( store.get('theme') ).trigger('change');
    }, 100)
 
     
})

$('#username').on("change paste keyup", function() {
    $('#wrong_credential').hide();
});

$('#password').on("change paste keyup", function() {
    $('#wrong_credential').hide();
});
  
$('#btnClose').click(()=> {
    remote.BrowserWindow.getFocusedWindow().close()
})

$("#checkAlwaysOnTop").change(() => {
    alwaysontopcheckchanged = true;
});

$('#btnSave').click(()=> {
    let $ = require('jquery')
    let username =  $('#username').val();
    let password = $("#password").val();
  
    let inputlist = $('#inputmedialist');
    let outputlist = $('#outputmedialist');
    let microphone = inputlist.children("option:selected").val();
    let speaker = outputlist.children("option:selected").val();

    // const audio = document.createElement('audio');
    // audio.setSinkId(speaker)
    
    store.set('sound', { microphone, speaker });
    store.set('credentials', { username, password });

    // Checkbox Auto Signin
    if($('#checkAutoSignin').is(':checked') ) {
        store.set('autosignin', true) 
    } else {
        store.set('autosignin', false) 
    } 
    // Checkbox Auto Signin

    // Checkbox Auto Launch
    var lauchAtStartUp = null
    if (process.platform !== 'darwin') {
         lauchAtStartUp = new AutoLaunch({
            name: 'monstervoipdeskphone',   
        }); 
    } else {
        lauchAtStartUp = new AutoLaunch({
            name: 'monstervoipdeskphone',
            // path: '/Applications/MonsterVoIP Desktop Phone.app',
            mac: {
                useLaunchAgent: true,
            },
        }); 
    }
   
    if($("#checkStartup").is(':checked')) {
        store.set('onstartup', true)
        lauchAtStartUp.enable()
    } else { 
        store.set('onstartup', false)
        lauchAtStartUp.disable()
    } 
    lauchAtStartUp.isEnabled().then(function(isEnabled) {
        if(isEnabled) { return; }
    }).catch(function(err) { console.log(err) });
    // Checkbox Auto Launch

    // Checkbox Always On Top
    if($("#checkAlwaysOnTop").is(':checked')) {
        store.set('alwaysontop', true)
    } else { 
        store.set('alwaysontop', false)
    }   
    // Checkbox Always On Top

    if (alwaysontopcheckchanged) {
        let WIN = remote.getCurrentWindow();
        let options = {
            type: "question",
            buttons: ["&Yes","&Not now"],
            defaultId: 0,
            title: "Monster VoIP Desktop Phone Restart to Apply Changes.",
            message: "Changing always on top setting requires app restart.",
            detail: "Do you want to restart app now?",
            //icon = "/path/image.png",
            cancelId: 1,
            noLink: true,
            normalizeAccessKeys: true
        }
        dialog.showMessageBox(WIN, options)
        .then(box => {
            // console.log('Button Clicked Index - ', box.response); 
            // console.log('Checkbox Checked - ', box.checkboxChecked); 
            if (box.response === 0) {   
                remote.app.relaunch();
                remote.app.exit(0);
            } else if (box.response === 1) { }
        }).catch(err => { 
            console.log(err)
        });
    }

    let theme = $('#theme').children("option:selected").val();
   
    if( store.get('theme') == undefined) {
        store.set('theme', 'Default')
    }
    if ( store.get('theme') != theme) {
        store.set('theme', theme);
        // const dialog = require('electron').remote.dialog;
        // let win = remote.BrowserWindow.getFocusedWindow()
        // dialog.showMessageBox(win, {
        //     title: 'Restart Required',
        //     buttons: ['OK'],
        //     type: 'info',
        //     message: 'Application needs a restart for changing theme...'
        // }).then((result) => {
        //     remote.app.relaunch();
        //     remote.app.exit(0);
        // });
    } else {
        store.set('theme', theme);
    }

    const axios = require('axios')
    axios.get('https://login.monstervoip.com/ns-api/oauth2/token/', {
        params: {
            grant_type: 'password',
            client_id: 'MonsterVoip',
            client_secret: 'ff4a34b226670041c46adb20362a4d84',
            username: username,
            password: password,
        }
    }).then(response => {
        if (response.data['access_token'].length) {
            // var identity = username.split("@");
            // var user = identity[0]; 
            // var domain = identity[1];
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
                    $('#wrong_credential').hide();
                    if (!alwaysontopcheckchanged) {
                        window.close()
                    }
                   
            //     } 
            // }).catch(error => { console.log(error); });

        } else {
            $('#wrong_credential').show();
        }
    }).catch(error => {
        $('#wrong_credential').show();
    });
});

$('#forgotpassword').click(() => {
    require("electron").shell.openExternal('https://login.monstervoip.com/portal/resets/forgotpassword');
})

$('#forgotlogin').click(() => {
    require("electron").shell.openExternal('https://login.monstervoip.com/portal/resets/forgotlogin');
})
 
 
// $("#checkStartup").change(function() {
   
// });

// $("#checkAutoSignin").change(function() {
   
// });
 

$('.min').click(()=> { 
    let win = remote.BrowserWindow.getFocusedWindow()
    win.minimize(); 
})

$('.x').click(()=> { 
    let win = remote.BrowserWindow.getFocusedWindow()
    win.close(); 
})