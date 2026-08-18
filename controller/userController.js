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
const holdUserController = async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await User.findByIdAndUpdate(
      id,
      { isHold: true },
      { new: true },
    );
    if (!userData) {
      return res.status(404).json({
        success: false,
        messsage: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      messsage: "User is hold",
    });
  } catch (error) {
    console.log("Hold user error ", error);
    return res.status(500).json({
      success: false,
      messsage: "Failed to hold user",
    });
  }
};
const deleteUserController = async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await User.findByIdAndDelete(id);

    // User না পাওয়া গেলে
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      userData,
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
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
      isHold,
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
        isHold,
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
const searchUserController = async (req, res) => {
  const { value } = req.body;

  try {
    if (!value || !value.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search value is required",
      });
    }

    const searchValue = value.trim();

    const users = await User.find({
      $or: [
        {
          firstName: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Users found",
      userData: users,
    });
  } catch (error) {
    console.log("Search user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
};
module.exports = {
  getAllUserController,
  getSingleUserController,
  deleteUserController,
  holdUserController,
  updateUserController,
  getUserVerifiedController,
  searchUserController,
};
