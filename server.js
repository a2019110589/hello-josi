var express = require("express");
var fs = require("fs");

var db = require("./db");

var site = express();

var server = site.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(host, port);
});

var template = "";
fs.readFile("template.html", function (err, data) {
  if (err) throw err;
  template = data;
});

site.get("/", function (req, res) {
  var html = "";
  html += template;

  var totalVendasQuery = "SELECT SUM(preco_produto) AS total_vendas FROM Vendas INNER JOIN Vendas_Produtos USING (id_venda) INNER JOIN Produtos USING (id_produto)";
  var produtosDisponiveisQuery = "SELECT count(id_produto) AS produtos_disponiveis FROM Produtos WHERE estado_produto = 'Disponível'";
  var projetosDecorrerQuery = "SELECT count(id_projeto) AS projetos_decorrer FROM Projetos WHERE estado_projeto = 'A Decorrer'";

  var query = `${totalVendasQuery};${produtosDisponiveisQuery};${projetosDecorrerQuery};`;

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<ul>";
    for (var i = 0; i < result.length; i++) {
      html += `<li><a href="/${result[i].TABLE_NAME.toLowerCase()}">${
        result[i].TABLE_NAME
      }</a></li>`;
    }
    html += "</ul>";

    res.send(html);
  });
});
