var User = Backbone.Model.extend({
  promptColor: function() {
    var cssColor = prompt("Please enter a CSS color:");
    this.set({color: cssColor});
  },
  
  initialize: function() { 
    // Fetch user from server...
    // do local stuff, possibly validation, units, etc
    console.log('user created locally');
    log(this);
    
    
    $('body').addClass('logged').removeClass('not-logged');
    // TODO: set user datas everywhere it shoud be.
    var me = this.get('me');
    var name = me.name;
    var email = me.email;
    var id = this.get('id');
    
    $('span.username').html(name);
    $('span.useremail').html(email);
     $('img.user_photo_square').attr('src', this.get('photo_square'));
     
     if(this.has('loc')){
       var loc = this.get('loc');
       $('span.userhomeaddress, input.homeaddress').html(loc.home.formatted_address).val(loc.home.formatted_address);
        $('span.userworkaddress, input.workaddress').html(loc.work.formatted_address).val(loc.work.formatted_address);
     }
  },

  logout: function(cb) { 
    FB.logout(function(res) {
      console.log('facebook cleared: '+res);
      window.location = window.location.origin;
      // user is now logged out
    });
    /*$.get('/api/logout', function(data){
      console.log('server sessions cleared: '+data);
      window.location = window.location.origin; //refresh current page... 
    });*/
  },

  coordinates: function() {}
  
  
});

