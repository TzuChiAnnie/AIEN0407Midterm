const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const url = require("url");
const session = require("express-session");
const mySQL = require("mysql");
const moment = require("moment-timezone");
const sha1 = require('sha1');
const db = mySQL.createConnection({
  host: "localhost",
  user: "root",
  password: "zaxscd0412",
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
app.get("/dis/:area?", (req, res) => {
  const district = require("./data/district.json");
  const food = require("./data/restaurant.json");

  res.render("dis",{district:district});
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
//RESTAURANT
app.get("/restaurant/:area?", (req, res) => {
  const restaurant = require("./data/restaurant.json");
  const dis = require("./data/district.json");
  const data = res.locals.renderData;
  const areares = [];
  const restaurantarea = [];
  const allres = [];
  if (req.url.substring(12) == "") {
    for (i = 0; i < dis.length; i++) {
      for (j = 0; j < restaurant.length; j++) {
        if(dis[i].Area==restaurant[j].Add.slice(3,6)){
          allres.push(restaurant[j]);
        }   
      }
    }
  } else {
    for (i = 0; i < dis.length; i++) {
      if (req.params.area === dis[i].Area) {
        areares.push(dis[i]);
      }
    }
    for (i = 0; i < restaurant.length; i++) {
      if (req.params.area === restaurant[i].Add.slice(3, 6)){
        restaurantarea.push(restaurant[i]);
      }
    }
  }
  data.restaurantarea = restaurantarea;
  data.allres = allres;
  data.areares = areares;
  data.dis = dis;
  res.render("restaurant", data);
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
//Sign up  完成80%(如果錯誤無法清除input內容)
app.get("/signup", (req, res) => {
  // const data = res.locals.renderData;
  // if (req.session.msg) {
  //   data.msg = req.session.msg;
  //   console.log(req.body);
  //   delete data;
  // }
  res.render("signup",data);
});
app.post('/signup', (req, res)=>{
  const data = res.locals.renderData;
  const val = {
    admin_id: req.body.admin_id,
    password: sha1(req.body.password),
    created_at:moment().format("YYYY-MM-DD HH:mm:ss")
  };
  data.addForm = val; 
  if (!req.body.admin_id || !req.body.password) {
    data.msg = {
      type: "danger",
      info: "帳號密碼必須輸入",
    };
    res.render("signup",data);
    return;
  }
  db.query("SELECT * FROM `admins` WHERE `admin_id`=?",
    [req.body.admin_id],
    (error, results, fields) => {
      if (results.length) {
        data.msg = {
          type: "danger",
          info: "帳號已存在",
        };
        res.render("signup", data);
        return;
      }
      const sql = "insert into admins set ?";
      db.query(sql, val, (error, results, fields) => {
        // console.log(results);//看inser結果
        if (error) {
          // console.log(error);
          res.send(error.sqlMessage);
          return;
        }
        if (results.affectedRows == 1) {
          data.msg = {
            type: "success",
            info: "帳號新增成功",
          };
        }
        // res.send("" + results.affectedRows);
        // res.render("signup", data);
        res.redirect('/login');
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
