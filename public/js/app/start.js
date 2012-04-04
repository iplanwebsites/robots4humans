$(function(){
  // START!
  app = {};
  app.router = new Router();
  app.ui = new Ui();
  app.debug = debug;
  if(app.debug) $('body').addClass('debug'); //us a listener instead, so we can set it from the console to test...
  // First, we fetch data from Server...
    $.get('/api/constant', function(data){
      log('constants received!');
      app.constant = new Constant(data);
      stripe_setup( app.constant.get('STRIPE_PUBLIC_DEV') );//setup stripe //FACEBOOK_APP_ID
      app.router.create_user(); //call this because if session is already set... (after the redirect, for instance...)
      facebook_setup();//setup fb //FACEBOOK_APP_ID
      //reveal website...
      
      
      
    });
    
    
    //$('.btn.login').button('loading'); // disable the button...
    
    
  // TODO: The ROutes arent running, create a basic nav...
  
})