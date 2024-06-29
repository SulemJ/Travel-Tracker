import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
let country;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


 db.connect();
 async function update() {
  const result = await db.query("select country_code from visited_countries");
  let countries = [];
  result.rows.forEach(element => {
    countries.push(element.country_code);
  });
  return countries;
 }
  
app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await update();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
  });

});


app.post("/add", async (req, res) => {
  let  str = req.body["country"];
 let modStr = str[0].toUpperCase() + str.slice(1);
  modStr.trim();
 const result = await db.query(`select country_code from countries where country_name like '%' || '${modStr}' || '%' `);
 if (result.rows.length !== 0) {
      const data = result.rows[0];
      const countryCode = data.country_code;

      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode,]);
      res.redirect("/");
}
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
