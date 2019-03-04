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
//儲存景點
router.post('/spot:area?',(req,res)=>{
    const spot = require('./data/spot.json')
    
    // console.log(req.body);
});
//儲存景點顯示
router.get("/savespot", (req, res) => {
  const data = res.locals.renderData;
  res.render("savespot", data);
});
//個人部落格顯示
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
    });
});
//發布文章
router.post("/user-blog", (req, res) => {
  const data = res.locals.renderData;
  const val = {
    admin_id: data.loginUser,
    title: req.body.title,
    message: req.body.message,
    createtime: moment().format("YYYY-MM-DD HH:mm:ss")
  };
  db.query("insert into post set ?", val, (error, results, fields) => {
    res.redirect("/user-blog");
  });
});
//修改顯示
router.get("/user-blog/edit/:title", (req, res) => {
  const data = res.locals.renderData;
  db.query(
    "select * from post where admin_id=? AND title=?",
    [data.loginUser,req.params.title],
    (error, results, fields) => {
      if (!results.length) {
        res.status(404);
        res.send("NO Data");
      } else {
        data.item = results[0];
        res.render("user-blog-edit", data);
      }
    });
});
//修改發布
router.post("/user-blog/edit/:title", (req, res) => {
  const data = res.locals.renderData;
  let my_result = {
    success: false,
    affectedRows: 0,
    info: "內容需輸入",
  };
  const val = {
    title: req.body.title,
    message: req.body.message,
    createtime:moment().format("YYYY-MM-DD HH:mm:ss")
  };
  if (!req.body.message) {
    res.json(my_result);
    return;
  }
   db.query("UPDATE `post` SET ? WHERE admin_id=? AND title=?", [val, data.loginUser,req.body.title], (error, results, fields) => {
      if (error) {
        console.log(error);
        res.send(error.sqlMessage);
        return;
      }else{
        my_result = {
          success: true,
          affectedRows: 1,
          info: "修改成功",
        };
        res.json(my_result);
       }
    });
});
//刪除
router.get("/user-blog/remove/:title", (req, res) => {
  // console.log(req.params.title);
  db.query(
    "delete from post where title=?",
    [req.params.title],
    (error, results, fields) => {
      res.redirect("/user-blog");
    });
});
module.exports = router;
