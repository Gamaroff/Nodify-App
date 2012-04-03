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

shop_name = "hand-ratke-and-green2603";
token_id = '';

// Routes
app.get('/', function(req, res) {
	var shop = undefined, token = undefined;

	if(req.session.shopify){
		token = req.session.shopify.t
		shop = req.session.shopify.shop
	}

	if(shop !== undefined && token !== undefined) {
		session = nodify.createSession(shop, token, config.apiKey, config.secret);

		if(session.valid()){
			product = {
				  "product": {
				    "body_html": "<strong>YAY!</strong>",	
				  }   
			};      
			session.product.all(function(err, data){
				if(err) { console.log(data); throw err;}
				res.send(data);
			});
		}
	}
	else {
		res.redirect('/login');
	}
		
});


app.get('/login', function(req, res) {

	session = nodify.createSession(shop_name, token_id, config.apiKey, config.secret);
	if(session.valid())
	{
		if(token_id === '') {
			res.redirect(session.createPermissionUrl());
		}
		else{
			res.redirect('/');
		}
	}
	else{
		res.send("Could not log in");
	}

});


app.get('/login/finalize', function(req, res) {
	params = req.query;
	req.session.shopify = params;
	session = nodify.createSession(req.query.shop, params.t, config.apiKey, config.secret, params);
	if(session.valid()){
		res.redirect("/");
	}
	else {
		res.send("Could not finalize");
	}
	
	
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
