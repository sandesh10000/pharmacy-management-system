const express = require("express");
const session = require("express-session");
const bodyparser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { nextTick } = require("process");
const encoder = bodyparser.urlencoded({ extended: true });

const app = express();

app.use(express.static("public"));

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

app.use(
  session({
    secret: uuidv4(),
    resave: "true",
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  check = req.session.loggedin;
  email = req.session.username;
  role = req.session.role;

  res.render("index");
});
app.get("/register", (req, res) => {
  check = req.session.loggedin;
  email = req.session.username;
  role = req.session.role;

  res.render("register");
});
app.get("/login", (req, res) => {
  check = req.session.loggedin;
  email = req.session.username;
  role = req.session.role;

  res.render("login");
});
app.get("/product", (req, res) => {
  check = req.session.loggedin;
  email = req.session.username;
  role = req.session.role;

  connection.query(
    "SELECT drug.dname AS user, userlogin.user_name AS user_name ,drug.star,drug.price FROM drug JOIN userlogin ON drug.id = userlogin.id",
    function (err, resu) {
      if (err) throw err;
      var prod = resu;
      ///res.render() function
      res.render("product", { drug: resu });
    }
  );
});
app.post("/product", (req, res) => {
  var dname = req.body.user;
  var star = req.body.star;
  var price = req.body.price;
  var pharma = req.body.user_name;
  var custemail = req.session.username;
  check = req.session.loggedin;
  if (check) {
    const quary =
      "insert into cart (pharma,dname,star,price,custemail)values(?,?,?,?,?);";
    connection.query(
      quary,
      [pharma, dname, star, price, custemail],
      function (error, result) {
        if (error) throw error;

        res.redirect("/cart");
      }
    );
  } else {
    console.log("please log in");
    res.redirect("/login");
  }
});
app.get("/cart", (req, res) => {
  check = req.session.loggedin;

  role = req.session.role;
  customeremail = req.session.username;
  cartt = "select * from cart where custemail=?";
  connection.query(cartt, [customeremail], function (error, results, fields) {
    // If there is an issue with the query, output the error
    if (error) throw error;
    // If the account exists
    res.render("cart", { carta: results });
  });
});
app.post("/cart", (req, res) => {
  id = req.body.id;
  dcart = "DELETE FROM cart WHERE id =?";
  connection.query(dcart, id, function (error, results, fields) {
    // If there is an issue with the query, output the error
    if (error) throw error;
    // If the account exists
    res.redirect("/cart");
  });
});

app.get("/records", (req, res) => {
  check = req.session.loggedin;
  email = req.session.username;
  role = req.session.role;

  connection.query("SELECT * FROM ncb", function (err, result) {
    if (err) throw err;

    ///res.render() function
    res.render("records", { data: result });
  });
});

app.get("/additem", (req, res) => {
  check = req.session.loggedin;
  email = req.session.username;
  role = req.session.role;

  res.render("additem");
});

app.post("/additem", encoder, function (req, res) {
  var dname = req.body.dname;
  var star = req.body.star;
  var price = req.body.price;
  check = req.session.loggedin;
  email = req.session.username;
  role = req.session.role;
  password = req.session.password;
  madd =
    "SELECT id FROM userlogin WHERE email = ? AND user_pass = ? AND role=?";
  connection.query(
    madd,
    [email, password, role],
    function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists

      // Authenticate the user
      var id = JSON.parse(JSON.stringify(results));
      var idx = parseInt(id[0].id);
      console.log(idx);
      const quary1 = "insert into drug (dname,star,price,id )values(?,?,?,?);";

      connection.query(
        quary1,
        [dname, star, price, idx],
        function (error, result) {
          if (error) throw error;

          res.redirect("/product");
        }
      );
    }
  );
});

app.post("/login", function (req, res) {
  // Capture the input fields
  let email = req.body.email;
  let password = req.body.password;
  let role = req.body.role;

  if (email && password && role) {
    mcl =
      "SELECT * FROM userlogin WHERE email = ? AND user_pass = ? AND role=?";
    connection.query(
      mcl,
      [email, password, role],
      function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          // Authenticate the user
          req.session.loggedin = true;
          req.session.username = email;
          req.session.role = role;
          req.session.password = password;

          // Redirect to home page
          res.redirect("/");
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      }
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});

app.post("/register", encoder, function (req, res) {
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

app.get("/logout", (req, res) => {
  req.session.loggedin = false;
  check = req.session.loggedin;
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      res.render("", { logout: "logout successfully" });
    }
  });
});
app.listen(3000, function () {
  console.log("server is up on port 3000");
});
