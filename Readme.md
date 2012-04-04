Facebook/Heroku sample app -- Node.js
=====================================

This is a sample app showing use of the Facebook Graph API, written in Node.js, designed for deployment to [Heroku](http://www.heroku.com/).

Based on the default node.js facebook template.






Run locally
-----------

Install dependencies:

    npm bundle install

    npm install -g express@2.5.1

[Create an app on Facebook](https://developers.facebook.com/apps) and set the Website URL to `http://localhost:5000/`.

Copy the App ID and Secret from the Facebook app settings page into your `.env`:

    echo FACEBOOK_APP_ID=12345 >> .env
    echo FACEBOOK_SECRET=abcde >> .env


    
Launch the app with [Foreman](http://blog.daviddollar.org/2011/05/06/introducing-foreman.html):

    gem install foreman #(if not installed already)

    foreman start  # then access it at http://127.0.0.1:5000/


to Auto-restart the server:

    gem install rerun
    
    then...
    
    rerun foreman start



Activate the debug console
-------------------------
    
Heroku (hosting) doesn'T appreciate debugging, but you can run the debug console locally if you tweak your local Procfile, juste make sure to not commit it to GIT. 

  web: node --debug web.js


You might need to install the node-inspector package first:

    npm install -g node-inspector



Deploy to Heroku 
-------------------------

If you prefer to deploy yourself, push this code to a new Heroku app on the Cedar stack, then copy the App ID and Secret into your config vars:

    heroku create --stack cedar
    git push heroku master
    heroku config:add FACEBOOK_APP_ID=12345 FACEBOOK_SECRET=abcde


Enter the URL for your Heroku app into the Website URL section of the Facebook app settings page, hen you can visit your app on the web.


Copyright
-------------------------

(c)2012, All rights reserved: iplanwebsite.com

Code available for educational purpose only

