require("dotenv").config();
const express = require("express");
const app = express();
const dbConfig = require("./confiq/dbConfig");
app.use(express.json());
dbConfig();
app.get("/", (req, res) => {
  res.send("hellow world");
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running ${port}`);
});
