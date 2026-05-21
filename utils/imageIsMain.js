const Product = require("../model/productSchema");
const isMianExist = async (req, findData) => {
  const isMain = await Product.findOne({ findData });
  if (isMain) {
    return true;
  } else {
    false;
  }
};
