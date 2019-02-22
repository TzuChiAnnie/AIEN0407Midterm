const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const url = require("url");
app.engine("hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  const district = require("./data/district.json");
  res.render("home", { district: district });
});
app.get("/spot/:area", (req, res) => {
  const spot = require("./data/spot.json");
  console.log(req.url.substring(6));
  console.log(encodeURIComponent(spot[0].Add.slice(3, 6)));
  console.log(typeof spot);
  //const urlParts = url.parse(req.url, true);
  //urlPart= JSON.parse(JSON.stringify(urlParts.query));
  //console.log(urlParts);
  for (i = 0; i < spot.length; i++) {
    if (req.url.substring(6) === encodeURIComponent(spot[i].Add.slice(3, 6))) {
      // console.log(spot[i]);
      const spotjson = spot[i];
      // const spotjson = JSON.stringify(spot[i]);
      console.log(typeof spotjson);
      // const data = res.locals.renderData;
      // data.spotjson = spotjson;
    }
    // else {
    //   console.log("false");
    // }
  }
  res.render("spot", spot[i]);
});
app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("Not Found Page...");
});
app.listen(3000, () => console.log("server start..."));
