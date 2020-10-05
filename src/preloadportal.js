const {ipcRenderer} = require('electron');
ipcRenderer.on('request-portal', function() {
    setTimeout(()=> {
        let $ = require('jquery');
        $('.login-message').hide();
        $('#login-box').css({'box-shadow': 'none'})
        $('#login-box').css({'-webkit-box-shadow': 'none'})
        $('#login-container').css({'background-color': '#fff'});
        $('.new-user-container').hide();
        $('#login-fields').hide();
        $('#login-submit').hide();
        $('#reset-container').hide();
        if(!$("#loading_image").length) {
            $('#login-box').append('<div id="loading_image" class="text-center"><img style="height: 120px;" src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/35771931234507.564a1d2403b3a.gif" /></div>');
        }
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
        $('#LoginUsername').val(username);
        $('#LoginPassword').val(password); 
        setTimeout(()=> {
            if ($('#LoginPassword').length > 0) {
                $('input[type="submit"]').trigger('click');
                $('#loading_image').remove();
            }
        }, 3000);
    }, 2000)
});