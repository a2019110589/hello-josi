var express = require("express");
var fs = require("fs");

var db = require("./db");

var site = express();

var server = site.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(host, port);
});

var header = "";
fs.readFile("header.html", function (err, data) {
  if (err) throw err;
  header = data;
});

site.get("/", function (req, res) {
  var html = "";
  var query =
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'a2019110589'";

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<ul>";
    for (var i = 0; i < result.length; i++) {
      html += `<li><a href='/${result[i].TABLE_NAME.toLowerCase()}'>${
        result[i].TABLE_NAME
      }</a></li>`;
    }
    html += "</ul>";

    res.send(
      "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
        header +
        "</head>" +
        "<body>" +
        html +
        "</body>" +
        "</html>"
    );
  });
});
