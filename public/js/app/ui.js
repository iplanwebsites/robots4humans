var Ui = Backbone.View.extend({

  el: $("body"),

  events: {
    "click button.btn.login":                       "login",
    "click  a.login":                      "login",
    "click .btn.share":                       "share",
    "click #modal_share .btn.close":          "share",
    "click .btn.fb_send_dialog":          "fb_send_dialog",
    "click .navbar li.nodebug":          "nodebug",
    //"click .button.edit":   "openEditDialog",
   // "click .button.delete": "destroy"
  },


  nodebug: function(ev) {
    $('body').removeClass('debug');
    alert('no debug!');
  },
  login: function(ev) {
    console.log('view: login fn')
    //FB.login();
    
    FB.login(function(response) {
       if (response.authResponse) {
         console.log('Welcome!  Fetching your information.... ');
         //app.router.create_user();
         /*FB.api('/me', function(response) {
           alert('Good to see you, ' + response.name + '.');
         });*/
       } else {
         console.log('User cancelled login or did not fully authorize.'); 
         $('.btn.login').button('reset')
         //TODO: remove loading state on BT, add extra info?? guidance...
       }
     }, {scope: 'user_likes,user_photos,user_photo_video_tags,email,user_location,user_website,user_religion_politics,user_interests,user_education_history,user_birthday,user_about_me'});
    
    
    //var e = ev['currentTarget'];
    var e = ev['srcElement'];
    $(e).button('loading');
   // no rendering...
  },
  share: function(ev) {
    var e = ev['srcElement'];
    $('#modal_share').modal('toggle');
    //open dialog
    /*
    if($(e).hasClass('active')){ // if already shown...
      $('#myModal').modal('hide');
      // window.history.back();
    }else{
      $('#myModal').modal('show');
      //app.router.navigate('share');
    }*/
    // $(e).button('toggle'); //toggle the button state...
  },
  fb_send_dialog: function() { //http://developers.facebook.com/docs/reference/dialogs/send/
    var me = app.user.get('me')
    var name = me.first_name || me.name; //TODO: rist name 
    var id = app.user.get('id')
    var desc = "At WeRoll we match friends and nearby commuters together to help everyone save time and money with their transportation."
        desc += "Just tell us about your commute, and we'll check if it'd make sense for you to rideshare with "+name;
        desc +=" and other friends. ";
    FB.ui({
              to: [4,5,8], // ['547730006', '614150942', '504515608']
              method: 'send',
              name: name+" would like to know if might be abble to rideshare together.",
              description: desc,
              link: 'http://weroll.net?ref='+id,
              
              });
  },
  removeLoading: function(){
    $('body').removeClass("loading")
    $('#cache').addClass("fade")
                           .delay(400)
                           .queue(function() {
                               $(this).remove(0);
                               $(this).dequeue();
    })// eo cache;
  },
  render: function() {
   // no rendering...
  }

});

  


/*

bt_add_file_from_dropbox: function(ev){ 
  //alert('bt import!'); 
  var el = ev['currentTarget'];
  var path = $(el).attr('data-path');
  //alert(path);
  Penwrite.app_router.add_file_from_dropbox(path);
  return false; //no link follow...
},*/
