var mysql = require("mysql");

var db = mysql.createConnection({
  host: "saturno.esec.pt",
  user: "a2019110589",
  password: "cdmfbd2223",
  database: "a2019110589",
  charset: "utf8",
  multipleStatements: true,
});

db.connect((error) => {
  if (error) {
    console.log(error.message);
  } else {
    console.log("MySQL conectado");
  }
});

module.exports = db;
