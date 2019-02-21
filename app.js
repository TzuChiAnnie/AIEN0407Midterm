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
  console.log(encodeURIComponent(spot[0].Add.slice(3,6)) );
  //const urlParts = url.parse(req.url, true);
  //urlPart= JSON.parse(JSON.stringify(urlParts.query));
  //console.log(urlParts);
  if (req.url.substring(6) == encodeURIComponent(spot[0].Add.slice(3,6))) {
    console.log("true");
  } else {
    console.log("false");
  }
  
  res.render("spot", { spot: spot });
});
app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("Not Found Page...");
});
app.listen(3000, () => console.log("server start..."));
