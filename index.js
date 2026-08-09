require("dotenv").config();
const express = require("express");
const app = express();
app.use("/uploads", express.static("uploads"));
const dbConfig = require("./confiq/dbConfig");
const authRoutes = require("./routes/auth");
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
dbConfig();

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running ${port}`);
});
