var Router = Backbone.Router.extend({
    routes: {
        '/': 'homepage',
        '/ref/:ref_id': 'homepage',
        '/logout': 'logout',
        '/driver/:user_id': 'driver',
        '/passenger/:user_id': 'passenger',
        '/rides': 'rides',
        '/commute': 'location',
        '/location': 'location',
        '/dashboard': 'dashboard',
        '/promo': 'promo',
        '/reserve': 'reserve',
        '/pay': 'pay',
        '/about': 'about',
        '/share': 'share',
        '/search/:query': 'search',
        '/search/:query/p:page': 'search',
        '/help': 'help'
    },

    section: function (s) {
        console.log('section: ' + s);
        if(s != 'share'){
          // close the popup share
        }
        //set active state on nav
        
        if($('.navbar li.'+s).length > 0){ 
          $('.navbar li').removeClass('active');
          $('.navbar li.'+s).addClass('active');
          }
        $('body').removeClass('dashboard promo location driver passenger').addClass(s);
        $('section').hide(0);
        $('section#' + s).show();
    },
    reserve: function (s) {
        this.section('reserve');
    },
    about: function (s) {
        this.section('about');
    },
    logout: function (s) {
      //alert('out!');
        app.user.logout(app.router.refresh_page);
    },
    rides: function (s) {
      if(! app.user.has('loc')){alert('you need to first set location'); }
      this.section('rides');
      $.get('/api/rides', function(data){
         console.log('api/rides');
          console.log(data);
          //for each entries, create a model (ride?)
         // attach a view to this model
         
         
        });
    },
    refresh_page: function (s) {
      alert('refresh!!');
        app.user.logout();
    },
    location: function (user_id) {
        this.section('location');
    },
    pay: function () {
        this.section('pay');
    },
    driver: function (user_id) {
        this.section('driver');
    },
    passenger: function (user_id) {
        this.section('passenger');
    },
    homepage: function (ref_id) {
        log('homepage');
        //alert('reffered by:' + ref_id);
        if (app.user) { //if there's a user...
            this.dashboard();
        } else {
            this.promo();
        }
    },
    dashboard: function () {
        this.section('dashboard');
    },
    promo: function () {
        this.section('promo');
    },
    help: function () {
        alert('help');
    },
    
    
  ///////////////////////////////////////////////////////////////////
 //    Auth Flow
////////////////////////////////////////////////////////////////
    create_user: function (cb) {  //one way method called once FB is sucefully connected on client-side
      console.log('fn: create_user');
        $.get('/api/user', function(data){
          
           console.log('api/user/data:');
            console.log(data);
            if(data.error){
              //no user yet...
              var route_has_run = Backbone.history.start({pushState: true});
              app.router.navigate('/', {trigger: true}); //f(!route_has_run)
              app.router.promo();
            }else{
              app.user = new User(data);
               var route_has_run = Backbone.history.start({pushState: true});
                app.router.navigate('/', {trigger: true}); //f(!route_has_run) 
                 if(! app.user.has('loc')){
                    app.router.location();
                  }else{//
                    app.router.location(); //DEBUG ONLY!
                    //app.router.rides();
                  }
            }
            app.ui.removeLoading(); //reveal interface: all loaded! tadam!
            app.router.prevent_default_href('#navbar a, #settings a, #option_menu a, nav a, #start a, a.route'); //will invalidate EXTERNAL links as well: TODO: be explicit...
          });
    },
    
    
    search: function (query, page) {
        log(query);
    },



    prevent_default_href: function (css_selector) {
        $(css_selector).click(function (e) {
            //alert('click!');
            var h = $(this).attr('href');
            log('ROUTE: '+h);
            if ((h.indexOf('http://') != 0) && (!$(this).hasClass('norun')) && (h != "")) { // if it's not an external link...
                // TODO: if CTRL key was pressed, let default happen... (open in a new page...)
                e.preventDefault();
                app.router.navigate(h, true);
                //return false;
            }
        })
    }


});