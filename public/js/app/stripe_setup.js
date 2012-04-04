
  ///////////////////////////////////////////////////////////////////
 //    Payment Provider
////////////////////////////////////////////////////////////////
   // stripe_key = '<%= process.env.STRIPE_PUBLIC_DEV %>';
function stripe_setup(stripe_key){
     Stripe.setPublishableKey(stripe_key); 
     log('Stripe has been setup:' + stripe_key);
     //Wire Form Action// http://stripe.com/docs/tutorials/forms
     $("#payment-form input #cc-amount").val(app.constant.get('BASE-PRICE'))
     $("#payment-form").submit(function(event) {
       log('submit');
       $('#error').hide();
       // disable the submit button to prevent repeated clicks
       $('.submit-button').attr("disabled", "disabled");

       var amount = $('#cc-amount').val(); // amount you want to charge in cents
       Stripe.createToken({
         number: $('.card-number').val(),
         cvc: $('.card-cvc').val(),
         exp_month: $('.card-expiry-month').val(),
         exp_year: $('.card-expiry-year').val()
       }, amount, stripeResponseHandler);

       // prevent the form from submitting with the default action
       return false;
     });
     
}
    

function stripeResponseHandler (status, response) {
      log(response);
      if (response.error) {
        $('#error').text(response.error.message);
        $('#error').slideDown(300);
        $('#stripe-form .submit-button').removeAttr("disabled");
        return;
      }

      var form = $("#payment-form");
      form.append("<input type='hidden' name='stripeToken' value='" + response.id + "'/>");

      $.post(
        form.attr('action'),
        form.serialize(),
        function (status) {
          if (status != 'ok') {
            $('#error').text(status);
            $('#error').slideDown(300);
          }
          else {
            $('#error').hide();
            $('#success').slideDown(300);
          }
          $('.submit-button').removeAttr("disabled");
        }
      );
}






