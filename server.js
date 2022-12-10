var express = require("express");
var site = express();

var db = require("./db");

var server = site.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(host, port);
});

site.get("/style.css", function (req, res) {
  res.sendFile(__dirname + "/style.css");
});
