const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const url = require("url");
const session = require("express-session");
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
  res.render("home", { district: district });
});
//SPOT
app.get("/spot/:area?", (req, res) => {
  const spot = require("./data/spot.json");
  const dis = require("./data/district.json");
  const area = [];
  const spotarea = [];
  const all = [];
  if (req.url.substring(6) == "") {
    for (i = 0; i < dis.length; i++) {
      for (j = 0; j < spot.length; j++) {
        if(dis[i].Area==spot[j].Add.slice(3,6)){
          const spotfilterjson = JSON.parse(JSON.stringify(spot[j]));
          all.push(spotfilterjson);
        }   
      }
    }
  } else {
    for (i = 0; i < dis.length; i++) {
      if (req.url.substring(6) === encodeURIComponent(dis[i].Area)) {
        var disfilterjson = JSON.parse(JSON.stringify(dis[i]));
        area.push(disfilterjson);
      }
    }
    for (i = 0; i < spot.length; i++) {
      if (
        req.url.substring(6) === encodeURIComponent(spot[i].Add.slice(3, 6))
      ) {
        var spotfilterjson = JSON.parse(JSON.stringify(spot[i]));
        spotarea.push(spotfilterjson);
      }
    }
  }
  res.render("spot", { all: all, area: area, spotarea: spotarea,dis:dis});
});
//ACTIVITY
app.get("/activity", (req, res) => {
  const activity = require("./data/activity.json");
  const actfilter = [];
  for (i = 0; i < activity.length; i++) {
    if (activity[i].Location.slice(0, 3)=="新北市"){
      var actfilterjson = JSON.parse(JSON.stringify(activity[i]));
      actfilter.push(actfilterjson);
    }
  }
  res.render("activity", {actfilter:actfilter});
});
//Login
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
// app.post('/login', (req, res)=>{
//   db.query("SELECT * FROM `admins` WHERE `admin_id`=? AND `password`=SHA1(?)",
//       [req.body.user, req.body.password],
//       (error, results, fields)=>{
//           console.log(results); // debug
//           if(! results.length){
//               req.session.flashMsg = {
//                   type: "danger",
//                   msg: "Error"
//               };
//           } else {
//               req.session.loginUser = req.body.user;
//               req.session.flashMsg = {
//                   type: "success",
//                   msg: "Success"
//               };
//           }
//           res.redirect('/login');
//       });
// });
//寫固定的帳號密碼
app.post("/login", (req, res) => {
  if (req.body.user === "annie" && req.body.password === "123") {
    req.session.loginUser = req.body.user;
    req.session.flashMsg = {
      type: "success",
      msg: "登入成功",
    };
  } else {
    req.session.flashMsg = {
      type: "danger",
      msg: "帳號或密碼錯誤",
    };
  }
  res.redirect("/login");
});

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
