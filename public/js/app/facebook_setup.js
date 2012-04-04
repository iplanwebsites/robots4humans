 function facebook_setup(){
    window.fbAsyncInit = function() {
      FB.init({
        appId      :  app.constant.get('FACEBOOK_APP_ID'),//'<%= app.id %>', // App ID
        channelUrl : window.location.origin + '/channel.html', // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true // parse XFBML
      });

      
      
       
       
      // Listen to the auth.login which will be called when the user logs in
      // using the Login button
      FB.Event.subscribe('auth.login', function(response) {
        // We want to reload the page now so PHP can read the cookie that the
        // Javascript SDK sat. But we don't want to use
        // window.location.reload() because if this is in a canvas there was a
        // post made to this page and a reload will trigger a message to the
        // user asking if they want to send data again.
        
        //alert('fb just logged! now: contact server...');
        window.location = window.location; //refresh current page... (shitty behavior.)
        //app.router.create_user();
        
        //console.log(FB);
        //alert('user logged! yay!')
        
      });

      FB.Canvas.setAutoGrow();
    };

    // Load the SDK Asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }
  
  
  
  
  
  /*
      function logResponse(response) {
        if (console && console.log) {
          //console.log('The response was', response);
          console.log(response);
      }*/
      
      
  // aka old garbage
  function logResponse(response){return log(response)}
      
      $(function(){
        // Set up so we handle click on the buttons
        $('#postToWall').click(function() {
          FB.ui(
            {
              method : 'feed',
              link   : $(this).attr('data-url')
            },
            function (response) {
              // If response is null the user canceled the dialog
              if (response != null) {
                logResponse(response);
              }
            }
          );
        });

        $('#sendToFriends').click(function() {
          FB.ui(
            {
              method : 'send',
              link   : $(this).attr('data-url')
            },
            function (response) {
              // If response is null the user canceled the dialog
              if (response != null) {
                logResponse(response);
              }
            }
          );
        });

        $('#sendRequest').click(function() {
          FB.ui(
            {
              method  : 'apprequests',
              message : $(this).attr('data-message')
            },
            function (response) {
              // If response is null the user canceled the dialog
              if (response != null) {
                logResponse(response);
              }
            }
          )}); //eo click...
        
      }); //eo dom ready
