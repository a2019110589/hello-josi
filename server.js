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
  var produtosDisponiveisQuery = "SELECT COUNT(id_produto) AS produtos_disponiveis FROM Produtos WHERE estado_produto = 'Disponível'";
  var projetosDecorrerQuery = "SELECT COUNT(id_projeto) AS projetos_decorrer FROM Projetos WHERE estado_projeto = 'A Decorrer'";

  var proximosProjetosQuery = "SELECT nome_projeto, nome_cliente, data_fim_projeto FROM Projetos INNER JOIN Clientes USING (id_cliente) WHERE estado_projeto = 'A Decorrer' ORDER BY data_fim_projeto LIMIT 3"
  var melhoresClientesQuery = "SELECT nome_cliente, pais_cliente, SUM(preco_produto) AS total_vendas FROM Clientes INNER JOIN Vendas USING (id_cliente) INNER JOIN Vendas_Produtos USING (id_venda) INNER JOIN Produtos USING (id_produto) GROUP BY nome_cliente, pais_cliente ORDER BY total_vendas DESC LIMIT 3;"

  var query = `${totalVendasQuery};${projetosDecorrerQuery};${produtosDisponiveisQuery};${proximosProjetosQuery};${melhoresClientesQuery}`;

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Home</h1>";
      html += "<div class='grid grid-flow-col items-start gap-6'>";
        html += "<div class='flex flex-col gap-2 bg-neutral-50 shadow rounded px-6 py-4'>";
          html += "<h4 class='font-semibold text-neutral-400'>Total de Vendas</h4>";
          html += `<h1 class='text-3xl font-semibold'>${result[0][0].total_vendas.toFixed(2)} €</h1>`;
        html += "</div>";
        html += "<div class='flex flex-col gap-2 bg-neutral-50 shadow rounded px-6 py-4'>";
          html += "<h4 class='font-semibold text-neutral-400'>Projetos a Decorrer</h4>";
          html += `<h1 class='text-3xl font-semibold'>${result[1][0].projetos_decorrer}</h1>`;
        html += "</div>";
        html += "<div class='flex flex-col gap-2 bg-neutral-50 shadow rounded px-6 py-4'>";
          html += "<h4 class='font-semibold text-neutral-400'>Produtos Disponíveis</h4>";
          html += `<h1 class='text-3xl font-semibold'>${result[2][0].produtos_disponiveis}</h1>`;
        html += "</div>";
      html += "</div>";
      html += "<div class='grid grid-flow-col items-start gap-6'>";
        html += "<div class='flex flex-col gap-4 bg-neutral-50 shadow rounded px-6 py-4'>";
          html += "<h4 class='font-semibold text-neutral-400'>Próximos Projetos</h4>"
          if (result && result.length > 0) {
            html += "<ul class='flex flex-col gap-4'>"
              for (var i = 0; i < result[3].length; i++) {
                html += "<li class='flex flex-col gap-2 p-2'>"
                  html += "<div class='flex items-center gap-2'>"
                    html += "<div class='w-2 h-2 bg-green-600 rounded-full'></div>"
                    html += `<small class='text-xs text-neutral-600 font-medium'>${formatarData(result[3][i].data_fim_projeto)}</small>`
                  html += "</div>"
                  html += `<h6 class='font-semibold'>${result[3][i].nome_projeto}</h6>`
                  html += "<div class='flex items-center gap-2'>"
                    html += `<img class='w-6 h-6 rounded-full' src='https://ui-avatars.com/api/?name=${result[3][i].nome_cliente}&background=random' alt='${result[3][i].nome_cliente}'>`
                    html += `<span>${result[3][i].nome_cliente}</span>`
                  html += "</div>"
                html += "</li>"
              }
            html += "</ul>"
          } else {
            html += "<p>Não existem próximos projetos!</p>"
          }
        html += "</div>"
        html += "<div class='flex flex-col gap-4 bg-neutral-50 shadow rounded px-6 py-4'>";
          html += "<h4 class='font-semibold text-neutral-400'>Melhores Clientes</h4>"
          if (result && result.length > 0) {
            html += "<ul class='flex flex-col gap-4'>"
              for (var i = 0; i < result[4].length; i++) {
                html += "<li class='flex items-center justify-between gap-8 p-2'>"
                  html += "<div class='flex items-center gap-3'>"
                    html += `<img class='w-6 h-6 rounded-full' src='https://ui-avatars.com/api/?name=${result[4][i].nome_cliente}&background=random' alt='${result[4][i].nome_cliente}'>`
                    html += "<div class='flex flex-col'>"
                      html += `<span class='text-neutral-900'>${result[4][i].nome_cliente}</span>`
                      html += `<span class='text-sm text-neutral-600'>${result[4][i].pais_cliente}</span>`
                    html += "</div>"
                  html += "</div>"
                  html += `<h5 class='bg-green-100 text-green-600 py-1 px-2 rounded-full font-semibold'>${result[4][i].total_vendas.toFixed(2)} €</h5>`
                html += "</li>"
              }
            html += "</ul>"
          } else {
            html += "<p>Não existem melhores clientes!</p>"
          }
        html += "</div>"
      html += "</div>";
    html += "</main>";

    res.send(html);
  });
});

site.get("/clientes", function (req, res) {
  var html = "";
  html += template;

  var query = "SELECT nome_cliente, email_cliente, telefone_cliente, morada_cliente, cidade_cliente, pais_cliente FROM Clientes";

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Clientes</h1>"
      if (result && result.length > 0) {
        html += "<table class='w-full shadow bg-neutral-50 rounded'>"
          html += "<thead>"
            html += "<tr class='border-b-2 border-neutral-100 text-left text-sm'>"
              html += "<th class='font-semibold p-3'>Cliente</th>"
              html += "<th class='font-semibold p-3'>Telefone</th>"
              html += "<th class='font-semibold p-3'>Morada</th>"
              html += "<th class='font-semibold p-3'>Cidade</th>"
              html += "<th class='font-semibold p-3'>País</th>"
            html += "</tr>"
          html += "</thead>"
          html += "<tbody>"
            for (var i = 0; i < result.length; i++) {
              html += "<tr class='text-neutral-600 border-b border-neutral-100 hover:bg-neutral-100 transition'>"
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center gap-3'>"
                    html += `<img class='w-6 h-6 rounded-full' src='https://ui-avatars.com/api/?name=${result[i].nome_cliente}&background=random' alt='${result[i].nome_cliente}'>`
                    html += "<div class='flex flex-col'>"
                      html += `<span class='text-neutral-900'>${result[i].nome_cliente}</span>`
                      html += `<span class='text-sm text-neutral-600'>${result[i].email_cliente}</span>`
                    html += "</div>"
                  html += "</div>"
                html += "</td>"
                html += `<td class='p-3'>${result[i].telefone_cliente}</td>`
                html += `<td class='p-3'>${result[i].morada_cliente}</td>`
                html += `<td class='p-3'>${result[i].cidade_cliente}</td>`
                html += `<td class='p-3'>${result[i].pais_cliente}</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center justify-end gap-4'>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-blue-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />"
                    html += "</svg>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-red-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />"
                    html += "</svg>"
                  html += "</div>"
                html += "</td>"
              html += "</tr>"
            }
          html += "</tbody>"
        html += "</table>"
      } else {
        html += "<p>Não foram encontrados clientes para mostrar!</p>"
      }
    html += "</main>"
    
    res.send(html);
  });
});

site.get("/departamentos", function (req, res) {
  var html = "";
  html += template;

  var query = "SELECT nome_departamento FROM Departamentos";

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Departamentos</h1>"
      if (result && result.length > 0) {
        html += "<table class='w-full shadow bg-neutral-50 rounded'>"
          html += "<thead>"
            html += "<tr class='border-b-2 border-neutral-100 text-left text-sm'>"
              html += "<th class='font-semibold p-3'>Departamento</th>"
            html += "</tr>"
          html += "</thead>"
          html += "<tbody>"
            for (var i = 0; i < result.length; i++) {
              html += "<tr class='text-neutral-600 border-b border-neutral-100 hover:bg-neutral-100 transition'>"
                html += `<td class='p-3'>${result[i].nome_departamento}</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center justify-end gap-4'>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-blue-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />"
                    html += "</svg>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-red-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />"
                    html += "</svg>"
                  html += "</div>"
                html += "</td>"
              html += "</tr>"
            }
          html += "</tbody>"
        html += "</table>"
      } else {
        html += "<p>Não foram encontrados departamentos para mostrar!</p>"
      }
    html += "</main>"
    
    res.send(html);
  });
});

site.get("/funcionarios", function (req, res) {
  var html = "";
  html += template;

  var query = "SELECT nome_funcionario, email_funcionario, nome_departamento, data_nascimento_funcionario, salario_funcionario, data_contrato_funcionario, regime_trabalho_funcionario FROM Funcionarios INNER JOIN Departamentos USING (id_departamento)";

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Funcionários</h1>"
      if (result && result.length > 0) {
        html += "<table class='w-full shadow bg-neutral-50 rounded'>"
          html += "<thead>"
            html += "<tr class='border-b-2 border-neutral-100 text-left text-sm'>"
              html += "<th class='font-semibold p-3'>Funcionário</th>"
              html += "<th class='font-semibold p-3'>Departamento</th>"
              html += "<th class='font-semibold p-3'>Data de Nascimento</th>"
              html += "<th class='font-semibold p-3'>Salário</th>"
              html += "<th class='font-semibold p-3'>Data de Contrato</th>"
              html += "<th class='font-semibold p-3'>Regime de Trabalho</th>"
            html += "</tr>"
          html += "</thead>"
          html += "<tbody>"
            for (var i = 0; i < result.length; i++) {
              html += "<tr class='text-neutral-600 border-b border-neutral-100 hover:bg-neutral-100 transition'>"
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center gap-3'>"
                    html += `<img class='w-6 h-6 rounded-full' src='https://ui-avatars.com/api/?name=${result[i].nome_funcionario}' alt='${result[i].nome_funcionario}'>`
                    html += "<div class='flex flex-col'>"
                      html += `<span class='text-neutral-900'>${result[i].nome_funcionario}</span>`
                      html += `<span class='text-sm text-neutral-600'>${result[i].email_funcionario}</span>`
                    html += "</div>"
                  html += "</div>"
                html += "</td>"
                html += `<td class='p-3'>${result[i].nome_departamento}</td>`
                html += `<td class='p-3'>${formatarData(result[i].data_nascimento_funcionario)}</td>`
                html += `<td class='p-3'>${result[i].salario_funcionario.toFixed(2)} €</td>`
                html += `<td class='p-3'>${formatarData(result[i].data_contrato_funcionario)}</td>`
                html += `<td class='p-3'>${result[i].regime_trabalho_funcionario}</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center justify-end gap-4'>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-blue-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />"
                    html += "</svg>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-red-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />"
                    html += "</svg>"
                  html += "</div>"
                html += "</td>"
              html += "</tr>"
            }
          html += "</tbody>"
        html += "</table>"
      } else {
        html += "<p>Não foram encontrados funcionários para mostrar!</p>"
      }
    html += "</main>"
    
    res.send(html);
  });
});

site.get("/produtos", function (req, res) {
  var html = "";
  html += template;

  var query = "SELECT nome_produto, categoria_produto, preco_produto, estado_produto, desconto_produto FROM Produtos";

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Produtos</h1>"
      if (result && result.length > 0) {
        html += "<table class='w-full shadow bg-neutral-50 rounded'>"
          html += "<thead>"
            html += "<tr class='border-b-2 border-neutral-100 text-left text-sm'>"
              html += "<th class='font-semibold p-3'>Produto</th>"
              html += "<th class='font-semibold p-3'>Categoria</th>"
              html += "<th class='font-semibold p-3'>Preço</th>"
              html += "<th class='font-semibold p-3'>Estado</th>"
            html += "</tr>"
          html += "</thead>"
          html += "<tbody>"
            for (var i = 0; i < result.length; i++) {
              html += "<tr class='text-neutral-600 border-b border-neutral-100 hover:bg-neutral-100 transition'>"
                html += `<td class='p-3'>${result[i].nome_produto}</td>`
                html += `<td class='p-3'>${result[i].categoria_produto}</td>`
                html += `<td class='p-3'>${result[i].preco_produto.toFixed(2)} €</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center gap-2'>"
                    if (result[i].estado_produto === "Disponível") {
                      html += `<span class='bg-green-100 text-sm text-green-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_produto}</span>`
                    } else if (result[i].estado_produto === "Em Promoção") {
                      html += `<span class='bg-yellow-100 text-sm text-yellow-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_produto}: ${result[i].desconto_produto.toFixed(2)} %</span>`
                    } else if (result[i].estado_produto === "Indisponível") {
                      html += `<span class='bg-red-100 text-sm text-red-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_produto}</span>`
                    } else {
                      html += `<span class='bg-neutral-100 text-sm text-neutral-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_produto}</span>`
                    }
                  html += "</div>"
                html += "</td>"
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center justify-end gap-4'>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-blue-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />"
                    html += "</svg>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-red-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />"
                    html += "</svg>"
                  html += "</div>"
                html += "</td>"
              html += "</tr>"
            }
          html += "</tbody>"
        html += "</table>"
      } else {
        html += "<p>Não foram encontrados produtos para mostrar!</p>"
      }
    html += "</main>"
    
    res.send(html);
  });
});

site.get("/projetos", function (req, res) {
  var html = "";
  html += template;

  var query = "SELECT nome_projeto, nome_cliente, data_inicio_projeto, data_fim_projeto, estado_projeto FROM Projetos INNER JOIN Clientes USING (id_cliente)";

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Projetos</h1>"
      if (result && result.length > 0) {
        html += "<table class='w-full shadow bg-neutral-50 rounded'>"
          html += "<thead>"
            html += "<tr class='border-b-2 border-neutral-100 text-left text-sm'>"
              html += "<th class='font-semibold p-3'>Projeto</th>"
              html += "<th class='font-semibold p-3'>Cliente</th>"
              html += "<th class='font-semibold p-3'>Data de Início</th>"
              html += "<th class='font-semibold p-3'>Data de Fim</th>"
              html += "<th class='font-semibold p-3'>Estado</th>"
            html += "</tr>"
          html += "</thead>"
          html += "<tbody>"
            for (var i = 0; i < result.length; i++) {
              html += "<tr class='text-neutral-600 border-b border-neutral-100 hover:bg-neutral-100 transition'>"
                html += `<td class='p-3'>${result[i].nome_projeto}</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center gap-2'>"
                    html += `<img class='w-6 h-6 rounded-full' src='https://ui-avatars.com/api/?name=${result[i].nome_cliente}&background=random' alt='${result[i].nome_cliente}'>`
                    html += `<span>${result[i].nome_cliente}</span>`
                  html += "</div>"
                html += "</td>"
                html += `<td class='p-3'>${formatarData(result[i].data_inicio_projeto)}</td>`
                html += `<td class='p-3'>${formatarData(result[i].data_fim_projeto)}</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center gap-2'>"
                    if (result[i].estado_projeto === "Aprovado") {
                      html += `<span class='bg-green-100 text-sm text-green-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_projeto}</span>`
                    } else if (result[i].estado_projeto === "A Decorrer") {
                      html += `<span class='bg-yellow-100 text-sm text-yellow-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_projeto}</span>`
                    } else if (result[i].estado_projeto === "Terminado") {
                      html += `<span class='bg-red-100 text-sm text-red-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_projeto}</span>`
                    } else {
                      html += `<span class='bg-neutral-100 text-sm text-neutral-600 py-1 px-2 rounded-full font-semibold'>${result[i].estado_projeto}</span>`
                    }
                  html += "</div>"
                html += "</td>"
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center justify-end gap-4'>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-blue-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />"
                    html += "</svg>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-red-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />"
                    html += "</svg>"
                  html += "</div>"
                html += "</td>"
              html += "</tr>"
            }
          html += "</tbody>"
        html += "</table>"
      } else {
        html += "<p>Não foram encontrados projetos para mostrar!</p>"
      }
    html += "</main>"
    
    res.send(html);
  });
});

site.get("/vendas", function (req, res) {
  var html = "";
  html += template;

  var query = "SELECT data_venda, hora_venda, nome_cliente, metodo_pagamento_venda FROM Vendas INNER JOIN Clientes USING (id_cliente)";

  db.query(query, function (err, result) {
    if (err) throw err;

    html += "<main class='h-full col-span-9 flex flex-col gap-8 p-8'>";
      html += "<h1 class='text-3xl font-semibold'>Vendas</h1>"
      if (result && result.length > 0) {
        html += "<table class='w-full shadow bg-neutral-50 rounded'>"
          html += "<thead>"
            html += "<tr class='border-b-2 border-neutral-100 text-left text-sm'>"
              html += "<th class='font-semibold p-3'>Data de Venda</th>"
              html += "<th class='font-semibold p-3'>Hora de Venda</th>"
              html += "<th class='font-semibold p-3'>Cliente</th>"
              html += "<th class='font-semibold p-3'>Método de Pagamento</th>"
            html += "</tr>"
          html += "</thead>"
          html += "<tbody>"
            for (var i = 0; i < result.length; i++) {
              html += "<tr class='text-neutral-600 border-b border-neutral-100 hover:bg-neutral-100 transition'>"
                html += `<td class='p-3'>${formatarData(result[i].data_venda)}</td>`
                html += `<td class='p-3'>${result[i].hora_venda}</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center gap-2'>"
                    html += `<img class='w-6 h-6 rounded-full' src='https://ui-avatars.com/api/?name=${result[i].nome_cliente}&background=random' alt='${result[i].nome_cliente}'>`
                    html += `<span>${result[i].nome_cliente}</span>`
                  html += "</div>"
                html += "</td>"

                html += `<td class='p-3'>${result[i].metodo_pagamento_venda}</td>`
                html += "<td class='p-3'>"
                  html += "<div class='flex items-center justify-end gap-4'>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-blue-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10' />"
                    html += "</svg>"
                    html += "<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='w-5 h-5 text-neutral-600 hover:text-red-600 transition cursor-pointer'>"
                      html += "<path stroke-linecap='round' stroke-linejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />"
                    html += "</svg>"
                  html += "</div>"
                html += "</td>"
              html += "</tr>"
            }
          html += "</tbody>"
        html += "</table>"
      } else {
        html += "<p>Não foram encontradas vendas para mostrar!</p>"
      }
    html += "</main>"
    
    res.send(html);
  });
});
