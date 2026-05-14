const User = require("../model/userSchema");
const getAllUserController = async (req, res) => {
  const userData = await User.find({});
  return res.status(200).json({
    success: true,
    message: "Get all UserData ",
    userData,
  });
};
const getSingleUserController = async (req, res) => {
  const { id } = req.params;
  const userData = await User.findById(id);
  return res.status(200).json({
    success: true,
    message: `get ${userData.email} data`,
    userData,
  });
};
const getUserVerifiedController = async (req, res) => {
  const userData = await User.find({ isVerified: true });

  return res.status(200).json({
    success: true,
    message: "Get all UserData ",
    userData,
  });
};
const deleteUserController = async (req, res) => {
  const { id } = req.params;
  const userData = await User.findByIdAndDelete({ id });
  return res.status(200).json({
    success: true,
    message: `Delete ${userData.email} data`,
    userData,
  });
};
const updateUserController = async (req, res) => {
  const { id } = req.params;
  const userData = await User.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: true,
    message: `Update  ${userData.email} data`,
    userData,
  });
};
module.exports = {
  getAllUserController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
  getUserVerifiedController,
};
