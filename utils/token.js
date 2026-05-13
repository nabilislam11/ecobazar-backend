const jwt = require("jsonwebtoken");
const tokenGenarator = (data, secret, expire) => {
  const token = jwt.sign(data, secret, { expiresIn: expire });
  return token;
};
module.exports = tokenGenarator;
