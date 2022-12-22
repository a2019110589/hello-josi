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

function formatarData(data) {
  return data.toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'});
}

site.get("/", function (req, res) {
  var html = "";
  html += template;

  var totalVendasQuery = "SELECT SUM(preco_produto) AS total_vendas FROM Vendas INNER JOIN Vendas_Produtos USING (id_venda) INNER JOIN Produtos USING (id_produto)";
  var produtosDisponiveisQuery = "SELECT count(id_produto) AS produtos_disponiveis FROM Produtos WHERE estado_produto = 'Disponível'";
  var projetosDecorrerQuery = "SELECT count(id_projeto) AS projetos_decorrer FROM Projetos WHERE estado_projeto = 'A Decorrer'";

  var projetosQuery = "SELECT nome_projeto, nome_cliente, data_fim_projeto FROM Projetos INNER JOIN Clientes USING (id_cliente) WHERE estado_projeto = 'A Decorrer' ORDER BY data_fim_projeto LIMIT 3"
  var clientesQuery = "SELECT nome_cliente, pais_cliente, SUM(preco_produto) AS total_vendas FROM Clientes INNER JOIN Vendas USING (id_cliente) INNER JOIN Vendas_Produtos USING (id_venda) INNER JOIN Produtos USING (id_produto) GROUP BY nome_cliente, pais_cliente ORDER BY total_vendas DESC LIMIT 3;"

  var query = `${totalVendasQuery};${projetosDecorrerQuery};${produtosDisponiveisQuery};${projetosQuery};${clientesQuery}`;

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Home</h1>";
      html += "<div class='grid grid-flow-col gap-6'>";

        html += "<div class='flex flex-col gap-2 bg-neutral-50 shadow-sm rounded px-6 py-4'>";
        html += "<h4 class='font-semibold text-neutral-400'>Total de Vendas</h4>";
        html += `<h1 class='text-3xl font-semibold'>${result[0][0].total_vendas.toFixed(2)} €</h1>`;
        html += "</div>";

        html += "<div class='flex flex-col gap-2 bg-neutral-50 shadow-sm rounded px-6 py-4'>";
        html += "<h4 class='font-semibold text-neutral-400'>Projetos a Decorrer</h4>";
        html += `<h1 class='text-3xl font-semibold'>${result[1][0].projetos_decorrer}</h1>`;
        html += "</div>";

        html += "<div class='flex flex-col gap-2 bg-neutral-50 shadow-sm rounded px-6 py-4'>";
        html += "<h4 class='font-semibold text-neutral-400'>Produtos Disponíveis</h4>";
        html += `<h1 class='text-3xl font-semibold'>${result[2][0].produtos_disponiveis}</h1>`;
        html += "</div>";

      html += "</div>";

      html += "<div class='grid grid-flow-col gap-6'>";

        html += "<div class='flex flex-col gap-4 bg-neutral-50 shadow-sm rounded px-6 py-4'>";
          html += "<h4 class='font-semibold text-neutral-400 text-lg'>Projetos</h4>"
          html += "<ul class='flex flex-col gap-4'>"

            html += "<li class='flex flex-col gap-2 p-2'>"
            html += "<div class='flex items-center gap-2'>"
            html += "<div class='w-2 h-2 bg-orange-600 rounded-full'></div>"
            html += `<small class='text-xs text-neutral-600 font-medium'>${formatarData(result[3][0].data_fim_projeto)}</small>`
            html += "</div>"
            html += `<h6 class='font-semibold'>${result[3][0].nome_projeto}</h6>`
            html += `<p class='text-sm text-neutral-600'>${result[3][0].nome_cliente}</p>`
            html += "</li>"

            html += "<li class='flex flex-col gap-2 p-2'>"
            html += "<div class='flex items-center gap-2'>"
            html += "<div class='w-2 h-2 bg-green-600 rounded-full'></div>"
            html += `<small class='text-xs text-neutral-600 font-medium'>${formatarData(result[3][1].data_fim_projeto)}</small>`
            html += "</div>"
            html += `<h6 class='font-semibold'>${result[3][1].nome_projeto}</h6>`
            html += `<p class='text-sm text-neutral-600'>${result[3][1].nome_cliente}</p>`
            html += "</li>"

            html += "<li class='flex flex-col gap-2 p-2'>"
            html += "<div class='flex items-center gap-2'>"
            html += "<div class='w-2 h-2 bg-green-600 rounded-full'></div>"
            html += `<small class='text-xs text-neutral-600 font-medium'>${formatarData(result[3][2].data_fim_projeto)}</small>`
            html += "</div>"
            html += `<h6 class='font-semibold'>${result[3][2].nome_projeto}</h6>`
            html += `<p class='text-sm text-neutral-600'>${result[3][2].nome_cliente}</p>`
            html += "</li>"

          html += "</ul>"
        html += "</div>"

      html += "</div>";

    html += "</main>";

    res.send(html);
  });
});
