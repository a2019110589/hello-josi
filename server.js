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

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
    html += "<h1 class='text-3xl font-semibold'>Home</h1>";
    html += "<div class='grid grid-flow-col gap-6'>";

    html += "<div class='flex flex-col gap-2 border border-neutral-200 rounded px-6 py-4'>";
    html += "<h4 class='font-semibold text-neutral-400'>Total de Vendas</h4>";
    html += `<h1 class='text-3xl font-semibold'>${result[0][0].total_vendas.toFixed(2)} €</h1>`;
    html += "</div>";

    html += "<div class='flex flex-col gap-2 border border-neutral-200 rounded px-6 py-4'>";
    html += "<h4 class='font-semibold text-neutral-400'>Projetos a Decorrer</h4>";
    html += `<h1 class='text-3xl font-semibold'>${result[1][0].produtos_disponiveis}</h1>`;
    html += "</div>";

    html += "<div class='flex flex-col gap-2 border border-neutral-200 rounded px-6 py-4'>";
    html += "<h4 class='font-semibold text-neutral-400'>Produtos Disponíveis</h4>";
    html += `<h1 class='text-3xl font-semibold'>${result[2][0].projetos_decorrer}</h1>`;
    html += "</div>";

    html += "</div>";
    html += "</main>";

    res.send(html);
  });
});
