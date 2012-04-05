/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();
var config = require ('./config.json');
var nodify = require('nodify-shopify');
 


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

			session.order.all({limit: 5}, function(err, orders){
				if(err) { console.log(orders); throw err;}

				session.product.all({limit: 5}, function(err, products){
					if(err) { console.log(products); throw err;}

					res.render("index", {title: "Nodify App", current_shop: shop , orders: orders, products: products});

				});

			});
		}
	}
	else {
		res.redirect('/login');
	}
		
});


app.get('/login', function(req, res) {
	try {
		shop = res.body.shop;
	}
	catch(error) {
		shop = undefined;
	}

	if(shop != undefined) {
		//redirect to auth
		res.redirect("/login/authenticate");
	}
	else{
		res.render("login", {title: "Nodify App"});
	}
});

app.post('/login/authenticate', function(req, res) {
	try {
		token = req.session.shopify.t;
	}
	catch(error) {
		token = '';
	}
	if(req.body.shop != null && req.body.shop != undefined) {	
		session = nodify.createSession(req.body.shop, token, config.apiKey, config.secret);
		if(session.valid())
		{
			if(token === '') {
				res.redirect(session.createPermissionUrl());
			}
			else{
				res.redirect('/');
			}
		}
		else{
			res.redirect('/login');
		}
	}
	else{
		res.redirect('/login');
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


app.get('/logout', function(req, res) {	
	if(req.session.shopify){
		req.session.shopify = null;
	}	
	res.redirect('/');
});

var port = process.env.PORT || 3000;

app.listen(port, function() {

	console.log("Running on: ", app.address().port);
});

