/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var config = require ('./config.json');
var nodify = require('nodify');



// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "shhhhh!!!!" }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

shop = "hand-ratke-and-green2603";
token = '';

// Routes
app.get('/', function(req, res) {
	if(req.session.shopify)
		token = req.session.shopify.t
	session = nodify.createSession(shop, token, config.apiKey, config.secret);
	if(session.valid())
	{
		if(token === '') {
			res.redirect(session.createPermissionUrl());
		}
		else{
			res.send("WE ARE IN!!");
		}
	}
	else{
		res.send("nope");
	}

});

app.get('/login', function(req, res) {
	
});



app.get('/login/finalize', function(req, res) {
	params = req.query;
	req.session.shopify = params;
	session = nodify.createSession(req.query.shop, params.t, config.apiKey, config.secret, params);
	console.log(session.site());
	res.redirect("/");	
	
});




app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
