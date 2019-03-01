const router = require('express').Router();
const mysql=require('mysql');
const moment = require("moment-timezone");
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zaxscd0412',
    database: 'test1'
});
router.use((req, res, next)=>{
    // console.log(status);
    if(! req.session.loginUser){
        res.status(403);
        res.redirect('login');
    } else {
        next();
    }
});
// router.get('/',(req,res)=>{
//     res.send('sales4-list');
//     db.query("select * from sales order by sid desc",
//         (error, results, fields) => {
//           // console.log(results);
//           // res.send('ok');
//           // for(let s in results){
//           //   results[s].birth=moment(results[s].birthday).format('YYYY-MM-DD');
//           // }
//           results.forEach(el => {
//             el.birth = moment(el.birthday).format("YYYY-MM-DD");
//           });
//           res.render("sales3", { sales: results });
//         }
//       );
// });
router.get('/savespot',(req,res)=>{
    const data = res.locals.renderData;
    res.render('savespot',data)
});
router.get('/blog',(req,res)=>{
    // const data = res.locals.renderData;
    db.query(
      "select * from post",
      (error, results, fields) => {
          console.log(results);
        // console.log(results);
        // res.send('ok');
        // for(let s in results){
        //   results[s].birth=moment(results[s].birthday).format('YYYY-MM-DD');
        // }
        // results.forEach(el => {
        //   el.birth = moment(el.birthday).format("YYYY-MM-DD");
        // });
        res.render('blog',{blog:results});
      }
    );
    // res.render('blog',data)
});
    

module.exports = router;