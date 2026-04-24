const jwt = require("jsonwebtoken");
const secureMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.send({ message: "unauthorized" });
    } else {
      next();
    }
  });
};
module.exports = secureMiddleware;
