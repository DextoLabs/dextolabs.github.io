var express = require('express');

var app = express();

app.use('/' , express.static(__dirname + '/'));


 app.get('/model', function(req, res){
   res.sendfile('model.html');
 });
 app.get('/room', function(req, res){
   res.sendfile('room.html');
 });
 app.get('/docs', function(req, res){
   res.sendfile('docs.html');
 });
 app.get('/', function(req, res){
   res.sendfile('index.html');
 });
app.listen(8080, function(){
    console.log("listenting on http://localhost:8080");
});
