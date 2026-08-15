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

  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      country,
      state,
      city,
      address,
      postalCode,
    } = req.body;

    const userData = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        country,
        state,
        city,
        address,
        postalCode,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      userData,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  getAllUserController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
  getUserVerifiedController,
};
