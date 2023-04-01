const express = require("express");
const router = express.Router();
const bodyparser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
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
//register user
router.post("/register", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const quary =
    "insert into userlogin (user_name,user_pass,email )values(?,?,?);";

  connection.query(
    quary,
    [username, password, email],
    function (error, result) {
      if (error) {
        res.redirect("/");
      } else {
        res.redirect("/login");
      }
    }
  );
});
//login user
router.post("/login", (req, res) => {
  const quary = "select * from userlogin ";
  connection.query(quary, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      const email = req.body.email;
      const password = req.body.password;
      const mysqldata = result;
      mysqldata.forEach(function (data) {
        if (data.email == email && data.user_pass == password) {
          res.redirect("/");
        }
      });
    }
  });
});
router.get("/records", (req, res) => {
  connection.query("SELECT * FROM ncb", function (err, result) {
    if (err) throw err;

    ///res.render() function
    res.render("records", { data: result });
  });
});
module.exports = router;
