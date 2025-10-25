import express from "express";

import axios from "axios";

const app = express();

const port = 3000;

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});
app.listen(port, () => {
  console.log(true);
});
