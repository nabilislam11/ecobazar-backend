require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use("/uploads", express.static("uploads"));
const dbConfig = require("./confiq/dbConfig");
const authRoutes = require("./routes/auth");
app.use(express.json());
app.use(cors());
app.use("/api/v1/auth", authRoutes);
dbConfig();

const port = process.env.PORT || 5000;

const util = require("node:util");

app.use((err, req, res, next) => {
  console.error("\n===== BACKEND ERROR =====");
  console.error(
    util.inspect(err, {
      depth: null,
      colors: true,
    }),
  );
  console.error("Error message:", err?.message);
  console.error("Error stack:", err?.stack);
  console.error("=========================\n");

  if (res.headersSent) {
    return next(err);
  }

  const message =
    err?.message || (typeof err === "string" ? err : "Unknown server error");

  res.status(err?.statusCode || err?.status || 500).json({
    success: false,
    message,
  });
});

app.listen(port, () => {
  console.log(`Server is running ${port}`);
});
