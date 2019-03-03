const router = require("express").Router();
const mysql = require("mysql");
const moment = require("moment-timezone");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "zaxscd0412",
  database: "test1"
});
router.use((req, res, next) => {
  if (!req.session.loginUser) {
    res.status(403);
    res.redirect("login");
  } else {
    next();
  }
});
router.get("/savespot", (req, res) => {
  const data = res.locals.renderData;
  res.render("savespot", data);
});
router.get("/user-blog", (req, res) => {
  const data = res.locals.renderData;
  db.query(
    "select * from post where admin_id=? order by createtime desc",
    [data.loginUser],
    (error, results, fields) => {
      for (let s in results) {
        results[s].createtime = moment(results[s].createtime).format(
          "YYYY-MM-DD HH:mm:ss"
        );
      }
      data.blog = results;
      res.render("userblog", data);
    }
  );
});
router.post("/user-blog", (req, res) => {
  const data = res.locals.renderData;
  const val = {
    admin_id: data.loginUser,
    title: req.body.title,
    message: req.body.message,
    createtime: moment().format("YYYY-MM-DD HH:mm:ss")
  };
  db.query("insert into post set ?", val, (error, results, fields) => {
    console.log(results);
    res.redirect("/user-blog");
  });
});
module.exports = router;
