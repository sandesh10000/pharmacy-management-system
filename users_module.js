const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: `userlogindb`,
});
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

exports.User = userObject;
