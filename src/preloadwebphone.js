const Store = require('./store.js');
const store = new Store({
    configName: 'user-preferences',
    defaults: { 
        credentials: { username: '', password: '' },
        onstartup: false,
        autosignin: false,
        autosignin_used: false,
    }
});

const {BrowserWindow, ipcRenderer, nativeImage} = require('electron');
const url = require('url')
const { remote } = require('electron');
const path = require('path');
var win = remote.BrowserWindow.getFocusedWindow()
let authToken = '';
let winAutosignin = null;

function addNotificationOverride() {
    let authentication_token = "";
    const Store = require('./store.js');
    const store = new Store({ configName: 'user-preferences'});
    let { username, password } = store.get('credentials')
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
            authentication_token = response.data['access_token'];
        }
    }).catch(error => {
        authentication_token = authToken;
    });

    var Notification = function(title, ops) {
        var identity = username.split("@");
        var user = identity[0]; 
        var domain = identity[1];
        var last_call_detail_ani = "0";
        var source = new EventSource('https://api.monstervoip.com/api/mvapi/stream/' + domain + '/' + user + '/' + authentication_token); 
        source.onmessage = function(e) {
            var str = e.data;  
            if (str != "") {
                var calldetails = JSON.parse(str)[0];
                if (calldetails.ani != last_call_detail_ani) {
                    last_call_detail_ani = calldetails.ani;
                    if (calldetails.time_answer == "0000-00-00 00:00:00") {
                        ipcRenderer.sendToHost('incomingcall', calldetails);
                    }
                }
            }
        }
    };

    Notification.requestPermission = () => {};
    Notification.permission = "granted"; 
    window.Notification = Notification;
}

function showAutosigninDialog() {
    const BrowserWindow = remote.BrowserWindow;
    winAutosignin = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true, 
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
}

ipcRenderer.on('request', function() {
    setTimeout(()=> {
        let $ = require('jquery');
        $('.nets-login-container').css({'background-color': '#fff'})
        $('div[class="text-center m-t-10 font-14"]').css({'display': 'none'}) // dont display whole div forgot password
        $('form[name="loginForm"]').hide();
        $('form[name="googleSsoForm"]').hide();
        $('form[name="officeSsoForm"]').hide();
        $('md-card').css({'box-shadow' : 'none'});
        const Store = require('./store.js');
        const store = new Store({ configName: 'user-preferences'});
        let { username, password } = store.get('credentials');
 
        if ( store.get('autosignin_used') == false ) {
            if (store.get('autosignin')) {
                if (!$('button[href="/webphone/logout"]').length > 0) {
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
                            showAutosigninDialog();
                            setTimeout(function() {
                                login(username, password)
                                setTimeout(function() {
                                    if ($('form[name="loginForm"]').length == 0) {
                                        ipcRenderer.sendToHost(returnLoginResult())
                                    }
                                }, 2500);
                            }, 3000);
                            
                            store.set('autosignin_used', true)

                                

                               
                        //     }
                        // }).catch(error => { console.log(error); });
   
                }
            }
        }
        
    }, 3000) 
    
});

ipcRenderer.on("send-to-webphone", function(event,data){
   
    if (data.signin) {
        let un = data.signin.user_name;
        let ps = data.signin.pass_word;
            setTimeout(() => {
                    // var identity = un.split("@");
                    // var user = identity[0]; 
                    // var domain = identity[1];
                    // const axios = require('axios')
                    // axios.get('https://api.monstervoip.com/api/mvapi/stream/' + domain + '/' + user, {}).then(response => {
                    // let allow = false;
                    // if (response.data['activated'] == 1) {
                    //     allow = true;
                    //     var todayDate = new Date();
                    //     axios.get('https://api.monstervoip.com/api/mvapi/stream/serverdatetime', {})
                    //     .then(response => {
                    //         todayDate = new Date( response.data);
                    //         console.log('serverdatetime: ', todayDate);
                    //     })
                    //     var dateOne = Date.parse(response.data['expiry_date']);
                    //     if (todayDate >= dateOne) { 
                    //         allow = false;
                    //         alert("Subscription Already Expired.")
                    //         remote.app.exit(0);
                    //     }
                    //     if (response.data['subscription_type'] == 'Standard') {
                    //         allow = false;
                    //         alert("You're in Standard Package, desktop app not included.")
                    //         remote.app.exit(0);
                    //     }
                    // } else {
                    //     allow = false;
                    //     alert("Desktop app not activated.")
                    //     remote.app.exit(0);
                    // }
                    // if (allow) {
                        login(un, ps);
                //     } 
                // }).catch(error => { console.log(error); });
  
            }, 3000);
    }
    if (data.signout) {
        let $ = require('jquery');
        if ($('button[href="/webphone/logout"]').length > 0) { 
            $('button[href="/webphone/logout"]').trigger('click');
            ipcRenderer.sendToHost('signout')
        } else {
            $('button[ng-click="$ctrl.openSideDrawer()"]').trigger('click');
            setTimeout(()=> {
                $('a[href="/webphone/logout"]')[0].click();
            }, 500)
        } 
        ipcRenderer.sendToHost('signout') 
    }

    if (data.portal) {
        console.log('data.portal start: ', data.portal)
        checkCredential(data.portal.user_name, data.portal.pass_word);
    }
    if (data.meeting) { 
        console.log('data.meeting start: ', data.meeting)
        checkMeetingCredential(data.meeting.user_name, data.meeting.pass_word)
    }

    if (data.callflow) {
        console.log('data.callflow start: ', data.callflow)
        checkCallFlowCredential(data.callflow.user_name, data.callflow.pass_word)
    }

    if (data.apps) {
        console.log('data.apps start: ', data.apps)
        checkAppsCredential(data.apps.user_name, data.apps.pass_word)
    }

    if (data.call) {
        let $ = require('jquery');
        if (data.call.status == "accepted") {
            $('button[ng-click="$ctrl.answer(call)"]').click();
            $('button[ng-click="$ctrl.answer(call)"]').trigger('click'); 
        } else {
            $('button[ng-click="$ctrl.reject(call)"]').click();
            $('button[ng-click="$ctrl.reject(call)"]').trigger('click');
        }
    }

});

function returnLoginResult() {
    let $ = require('jquery');
    setTimeout(() => {
        $('button[ng-click="$ctrl.next();"]').click();
        $('button[ng-click="$ctrl.next();"]').trigger('click');
    }, 2000); 

    setTimeout(() => {
        $('button[ng-click="$ctrl.dismiss();"]').click();
        $('button[ng-click="$ctrl.dismiss();"]').trigger('click');
    }, 2500);
    return "signedin";
}

function login(username, password) { 
    let $ = require('jquery')
    $('#login_error').remove();
    if(!$("#loading_image").length) {

        $('.p-b-8').append('<div id="loading_image" class="text-center"><img style="height: 120px;" src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" /></div>');
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
 
            authToken = response.data['access_token'];
            addNotificationOverride();
            //AUTO TYPE
            let un =  $('#input_0')
            let ps =  $('#input_1')
            let btn = $('button[type="submit"]')
            $('input[ng-model="name"]').change(function() {
                $(this).val(username)
                angular.element($(this)).triggerHandler('change')
            }); 
            un.trigger('input')
            un.trigger('change')
            setTimeout(() => {
                $('input[ng-model="password"]').change(function() {
                    $(this).val(password);
                    angular.element($(this)).triggerHandler('change')
                })
                ps.trigger('input')
                ps.trigger('change')
            }, 1000)
            setTimeout(() => { 
                if ($('input[ng-model="password"]').length > 0) {
                    btn.trigger('click') 
                    console.log('trigger submit click');
                    ipcRenderer.sendToHost(returnLoginResult())
                    $('#loading_image').remove();
                    // setMaximized(true)
                   
                }
            }, 2000)
            //AUTO TYPE
        }
    }).catch(error => {
        $('#loading_image').remove();
        $('.p-b-8').append('<div id="login_error" class="text-center"><b>Incorrect Username or Password.</b><br><small>Please enter the right credentials on settings.</small></div>');
        setTimeout(() => {
            $('#login_error').remove();
        }, 10000);
    });
}

function checkCredential(username, password) {
    console.log('inside credential', username)
    console.log('inside credential', password)
    let $ = require('jquery')
    $('#login_error').remove();
    if(!$("#loading_image").length) {
        $('.p-b-8').append('<div id="loading_image" class="text-center"><img style="height: 120px;" src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" /></div>');
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
            console.log('PORTAL OK');
            ipcRenderer.sendToHost('portal_ok')
            $('#loading_image').remove();
            $('.p-b-8').append('<div id="login_error" class="text-center"><b>Portal Login Successful.</b><br><small>Monster VoIP PBX portal is opened on background.</small></div>');
            setTimeout(() => {
                $('#login_error').remove();
            }, 10000);
        }
    }).catch(error => {
        console.log('PORTAL FAILED');
        ipcRenderer.sendToHost('portal_failed')
        $('#loading_image').remove();
        $('.p-b-8').append('<div id="login_error" class="text-center"><b>Incorrect Username or Password for the Portal.</b><br><small>Please enter the right credentials on settings.</small></div>');
        setTimeout(() => {
            $('#login_error').remove();
        }, 10000);
    });
}

function checkMeetingCredential(username, password) { 
    let $ = require('jquery')
    $('#login_error').remove();
    if(!$("#loading_image").length) {
        $('.p-b-8').append('<div id="loading_image" class="text-center"><img style="height: 120px;" src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" /></div>');
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
            console.log('MEETING OK');
            ipcRenderer.sendToHost('meeting_ok')
            $('#loading_image').remove();
            $('.p-b-8').append('<div id="login_error" class="text-center"><b>Meeting Login Successful.</b><br><small>Meetings is opened on background.</small></div>');
            setTimeout(() => {
                $('#login_error').remove();
            }, 10000);
        }
    }).catch(error => {
        console.log('MEETING FAILED');
        ipcRenderer.sendToHost('meeting_failed')
        $('#loading_image').remove();
        $('.p-b-8').append('<div id="login_error" class="text-center"><b>Incorrect Username or Password for the Meetings.</b><br><small>Please enter the right credentials on settings.</small></div>');
        setTimeout(() => {
            $('#login_error').remove();
        }, 10000);
    });
}

function checkCallFlowCredential(username, password) {
    let $ = require('jquery')
    $('#login_error').remove();
    if(!$("#loading_image").length) {
        $('.p-b-8').append('<div id="loading_image" class="text-center"><img style="height: 120px;" src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" /></div>');
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
            console.log('CALLFLOW OK');
            ipcRenderer.sendToHost('callflow_ok')
            $('#loading_image').remove();
            $('.p-b-8').append('<div id="login_error" class="text-center"><b>Call Flow Login Successful.</b><br><small>Monster VoIP Attendant Console is opened on background.</small></div>');
            setTimeout(() => {
                $('#login_error').remove();
            }, 10000);
        }
    }).catch(error => {
        console.log('CALLFLOW FAILED');
        ipcRenderer.sendToHost('callflow_failed')
        $('#loading_image').remove();
        $('.p-b-8').append('<div id="login_error" class="text-center"><b>Incorrect Username or Password for the Attendant Console.</b><br><small>Please enter the right credentials on settings.</small></div>');
        setTimeout(() => {
            $('#login_error').remove();
        }, 10000);
    });
}

function checkAppsCredential(username, password) {
    let $ = require('jquery')
    $('#login_error').remove();
    if(!$("#loading_image").length) {
        $('.p-b-8').append('<div id="loading_image" class="text-center"><img style="height: 120px;" src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" /></div>');
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
            console.log('APPS OK');
            ipcRenderer.sendToHost('apps_ok')
            $('#loading_image').remove();
            $('.p-b-8').append('<div id="login_error" class="text-center"><b>Apps Login Successful.</b><br><small>Monster VoIP Apps is opened on background.</small></div>');
            setTimeout(() => {
                $('#login_error').remove();
            }, 10000);
        }
    }).catch(error => {
        console.log('APP FAILED');
        ipcRenderer.sendToHost('apps_failed')
        $('#loading_image').remove();
        $('.p-b-8').append('<div id="login_error" class="text-center"><b>Incorrect Username or Password for the Apps.</b><br><small>Please enter the right credentials on settings.</small></div>');
        setTimeout(() => {
            $('#login_error').remove();
        }, 10000);
    });
}