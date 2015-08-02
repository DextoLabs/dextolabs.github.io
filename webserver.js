var express = require('express');

var app = express();

app.use('/' , express.static(__dirname + '/'));


 app.get('/model', function(req, res){
   res.sendfile('model.html');
 });
 app.get('/login', function(req, res){
   res.sendfile('login.html');
 });
 app.get('/signup', function(req, res){
   res.sendfile('signup.html');
 });
 app.get('/dashboard', function(req, res){
   res.sendfile('dashboard.html');
 });
 app.get('/', function(req, res){
   res.sendfile('index.html');
 });
app.listen(8080, function(){
    console.log("listenting on http://localhost:8080");
});
