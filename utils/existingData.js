const user = require("../model/userSchema");
const existingData = async (res, findData) => {
  const existinguser = await User.findOne({ findData });

  if (existinguser) {
    return true;
  }
  return false;
};
module.exports = existingData;
