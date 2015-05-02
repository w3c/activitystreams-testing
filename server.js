/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var app            = express();
var config         = require('./config/config');

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json
app.use(methodOverride()); // simulate DELETE and PUT

app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('host', process.env.VCAP_APP_HOST || 'localhost'); // The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application
app.set('port', process.env.VCAP_APP_PORT || '3000'); // The port on the DEA for communication with the application

var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}"); // VCAP_APPLICATION contains useful information about a deployed application.
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.
app.set('view engine', 'ejs');




// routes ======================================================================
require('./routes/routes.js')(app, config); // load our routes and pass in our app, config


// Start server
app.listen(app.get('port'), app.get('host'));
console.log('App started on ' + app.get('host') + ':' + app.get('port'));


process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  process.exit( );
})