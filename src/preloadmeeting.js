const {ipcRenderer} = require('electron');
ipcRenderer.on('request-meeting', function() {
    setTimeout(()=> {
        let $ = require('jquery');
        // $('.login-message').hide();
        // $('#login-box').css({'box-shadow': 'none'})
        // $('#login-box').css({'-webkit-box-shadow': 'none'})
        // $('#login-container').css({'background-color': '#fff'});
        // $('.new-user-container').hide();
        // $('#login-fields').hide();
        // $('#login-submit').hide();
        // $('#reset-container').hide();
        // if(!$("#loading_image").length) {
        //     $('#login-box').append('<div id="loading_image" class="text-center"><img style="height: 120px;" src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" /></div>');
        // }
 
         
 
       ///url("https://login.monstervoip.com/ns-api/?object=image&action=read&server=login.monstervoip.com&filename=portal_landing.png")
        var x = $('.react-flex-item')[0];
        var y = $(x).find('div:first-child');
        y.css({
            'height': '372px',
            'padding': '0px 25px',
            'background-image': 'none',
            'background-size': 'cover'
       })
       var img = $('<img />').attr('src', 'https://login.monstervoip.com/ns-api/?object=image&action=read&server=login.monstervoip.com&filename=portal_landing.png')
       img.css({
        'margin': '20%'
       })
       y.append(img)

       $("div[class$='_subTitle']").hide();
       var un = $("div[class$='_userInput']")//.css({ 'background-color': 'red' })
       un.find('label').hide();
       un.find('input').hide();
       un.find('hr').hide();
       var ps = $("div[class$='_passInput']");
       ps.find('label').hide();
       ps.find('input').hide();
       ps.find('hr').hide();
    
        const Store = require('./store.js');
        const store = new Store({
            configName: 'user-preferences',
            defaults: { 
                credentials: { username: '', password: '' }, 
                onstartup: false,
                autosignin: false,
            }
        });
        let { username, password } = store.get('credentials');
 
        const runInject = () => { 
            function simulateClick1() {
                const event = new MouseEvent('focus', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                }); 
                const event2 = new MouseEvent('blur', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                const cb = document.querySelector("input[id^='undefined-undefined-Loginname']"); 
                cb.dispatchEvent(event);
                cb.dispatchEvent(event2); 
            }

            function simulateClick2() {
                const event = new MouseEvent('focus', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                const event2 = new MouseEvent('blur', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                const cb = document.querySelector("input[id^='undefined-undefined-Password']"); 
                cb.dispatchEvent(event);
                cb.dispatchEvent(event2);
            }
            
            const target1 = $("input[id^='undefined-undefined-Loginname']")[0];
            var event1 = document.createEvent("HTMLEvents");   
            $("input[id^='undefined-undefined-Loginname']").val(username).attr('value', username);
            event1.initEvent("input", true, true); 
            target1.dispatchEvent(event1)
            simulateClick1()
            
            setTimeout(() => {
                var target2 = $("input[id^='undefined-undefined-Password']")[0]
                var event2 = document.createEvent("HTMLEvents");
                $("input[id^='undefined-undefined-Password']").val(password).attr('value', password);
                event2.initEvent("input", true, true);
                target2.dispatchEvent(event2); 
                simulateClick2() 
                $('button[type="submit"]').trigger('click');
            }, 1000);
        };
 
        setTimeout(()=> {
            if ($("input[id^='undefined-undefined-Password-']").length > 0) {
                runInject()
                $('button[type="submit"]').trigger('click');
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                const cb = document.querySelector('button[type="submit"]'); 
                cb.dispatchEvent(event); 
                //$('#loading_image').remove();
            }
        }, 3000);

    }, 2000)
});