const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const url = require("url");
const session = require("express-session");
const mySQL = require("mysql");
const db = mySQL.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "test",
});
db.connect();
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: "fehfjioepj",
    cookie: { maxAge: 1800000 },
  })
);
//自訂middleware
app.use((req, res, next) => {
  res.locals.renderData = {
    loginUser: req.session.loginUser,
  };
  next();
});
//HOME
app.get("/", (req, res) => {
  const district = require("./data/district.json");
  const data = res.locals.renderData;
  data.district = district;
  res.render("home", data);
});
//SPOT
app.get("/spot/:area?", (req, res) => {
  const spot = require("./data/spot.json");
  const dis = require("./data/district.json");
  const data = res.locals.renderData;
  const area = [];
  const spotarea = [];
  const all = [];
  if (req.url.substring(6) == "") {
    for (i = 0; i < dis.length; i++) {
      for (j = 0; j < spot.length; j++) {
        if(dis[i].Area==spot[j].Add.slice(3,6)){
          all.push(spot[j]);
        }   
      }
    }
  } else {
    for (i = 0; i < dis.length; i++) {
      if (req.url.substring(6) === encodeURIComponent(dis[i].Area)) {
        area.push(dis[i]);
      }
    }
    for (i = 0; i < spot.length; i++) {
      if (
        req.url.substring(6) === encodeURIComponent(spot[i].Add.slice(3, 6))
      ) {
        spotarea.push(spot[i]);
      }
    }
  }
  data.all = all;
  data.area = area;
  data.spotarea = spotarea;
  data.dis = dis;
  res.render("spot", data);
});
//ACTIVITY
app.get("/activity", (req, res) => {
  const activity = require("./data/activity.json");
  const data = res.locals.renderData;
  const actfilter = [];
  for (i = 0; i < activity.length; i++) {
    if (activity[i].Location.slice(0, 3)=="新北市"){
      actfilter.push(activity[i]);
    }
  }
  data.actfilter=actfilter;
  res.render("activity2", data);
});
//Sign up
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.post('/signup', (req, res)=>{
  const data = res.locals.renderData;
  const val = {
    sales_id: req.body.sales_id,
    name: req.body.name,
    birthday: req.body.birthday,
  };
  data.addForm = val;
  if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(req.body.birthday)) {
    data.msg = {
      type: "danger",
      info: "Birthday input Wrong",
    };
    res.render("sales3-add", data);
    return;
  }
  if (!req.body.sales_id || !req.body.name || !req.body.birthday) {
    data.msg = {
      type: "danger",
      info: "All blank need input",
    };
    res.render("sales3-add", data);
    return;
  }
  db.query(
    "SELECT 1 FROM `sales` WHERE `sales_id`=?",
    [req.body.sales_id],
    (error, results, fields) => {
      if (results.length) {
        data.msg = {
          type: "danger",
          info: "sales_id is used",
        };
        res.render("sales3_add", data);
        return;
      }
      const sql = "insert into sales set ?";
      db.query(sql, val, (error, results, fields) => {
        if (error) {
          console.log(error);
          res.send(error.sqlMessage);
          return;
        }
        if (results.affectedRows == 1) {
          data.msg = {
            type: "success",
            info: "Add success",
          };
        }
        // res.send("" + results.affectedRows);
        res.render("sales3-add", data);
      });
    }
  );
});
//Sign in
app.get("/login", (req, res) => {
  const data = res.locals.renderData;
  if (req.session.flashMsg) {
    data.flashMsg = req.session.flashMsg;
    delete req.session.flashMsg;
  }
  // data.logined=!!req.session.loginUser;
  // data.loginUser=req.session.loginUser;
  res.render("login", data);
});
app.post('/login', (req, res)=>{
  db.query("SELECT * FROM `admins` WHERE `admin_id`=? AND `password`=SHA1(?)",
      [req.body.user, req.body.password],
      (error, results, fields)=>{
          // console.log(results); // debug
          if(! results.length){
              req.session.flashMsg = {
                  type: "danger",
                  msg: "帳號或密碼錯誤"
              };
          } else {
              req.session.loginUser = req.body.user;
              req.session.flashMsg = {
                  type: "success",
                  msg: "登入成功"
              };
          }
          res.redirect('/login');
      });
});
//寫固定的帳號密碼
// app.post("/login", (req, res) => {
//   if (req.body.user === "annie" && req.body.password === "123") {
//     req.session.loginUser = req.body.user;
//     req.session.flashMsg = {
//       type: "success",
//       msg: "登入成功",
//     };
//   } else {
//     req.session.flashMsg = {
//       type: "danger",
//       msg: "帳號或密碼錯誤",
//     };
//   }
//   res.redirect("/login");
// });

app.get("/logout", (req, res) => {
  delete req.session.loginUser;
  res.redirect("/login");
});
app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("Not Found Page...");
});
app.listen(3000, () => console.log("server start..."));
