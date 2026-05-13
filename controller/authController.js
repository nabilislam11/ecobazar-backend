const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const { mailVerification, resetPassword } = require("../utils/email");
const emptyFieldValidation = require("../utils/validation");
const tokenGenarator = require("../utils/token");
const bcrypt = require("bcrypt");

const registrationController = async (req, res) => {
  const { email, password, confirmPassword, terms } = req.body;
  if (!terms) {
    return res.status(400).json({
      message: "Select the terms and condition ",
    });
  }
  const existinguser = await User.findOne({ email: email });
  try {
    if (existinguser) {
      return res.status(401).json({
        success: false,
        message: "This user is already exists",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password was not match",
      });
    }
    const hash = bcrypt.hashSync(password, 10);
    let user = new User({
      email: email,
      password: hash,
      terms: terms,
    });
    await user.save();

    const token = tokenGenarator(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      "1d",
    );
    await mailVerification(token, email);
    return res.status(201).json({
      success: true,
      message: "Registration successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error ",
    });
  }
  //   emptyFieldValidation(email, password, confirmPassword, terms);
  //   return res.status(201).json({
  //     success: true,
  //     message: "Registration successfull",
  //   });
};
const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This user not registered ",
      });
    }

    emptyFieldValidation(res, email, password);

    let pass = bcrypt.compareSync(password, user.password);
    if (!pass) {
      return res.status(401).json({
        message: "Invalied Credential ",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Suggesfully login",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};
const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  emptyFieldValidation(res, email);

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "This user not registered ",
    });
  }

  const token = tokenGenarator(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    "1d",
  );
  console.log("ORIGINAL TOKEN:", token);
  resetPassword(token, email);
  return res.status(201).json({
    success: true,
    message: "Please check your email",
  });
};
const resetPasswordController = async (req, res) => {
  const { token } = req.params;
  console.log("TOKEN FROM PARAM:", token);
  console.log("TOKEN LENGTH:", token.length);
  const { newPassword, confirmPassword } = req.body;
  console.log(req.body, "body");

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Password did not match",
      });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded, "decoded ");

    console.log(newPassword, "passwar");
    const hash = bcrypt.hashSync(newPassword, 10);
    console.log(hash, "hasj");

    const updateData = await User.findByIdAndUpdate(
      decoded.id,

      { password: hash },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
    // jwt.verify(
    //   token,
    //   process.env.ACCESS_TOKEN_SECRET,
    //   async function (err, decoded) {
    //     if (err) {
    //       res.send({ message: "unauthorized" });
    //     } else {
    //       const hash = bcrypt.hashSync(newPassword, 10);
    //       const updateData = await User.findByIdAndUpdate(
    //         { _id: decoded.id },
    //         { password: hash },
    //       );
    //       res.status({ message: "Password updated successfully" });
    //     }
    //   },
    // );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const resentVerificationController = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        message: "User is already verified",
      });
    }
    const token = tokenGenarator(
      {
        id: user._id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      "1d",
    );

    await mailVerification(token, email);
    return res.status(200).json({
      success: true,
      message: "Please verify your email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error ",
    });
  }
};
const verifyEmailController = async (req, res) => {
  const { token } = req.params;
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    async function (err, decoded) {
      if (err) {
        return res.status(400).json({
          message: "unauthorized",
        });
      }
      try {
        const user = decoded.id;
        const findUser = await User.findById(user);
        if (findUser.isVerified) {
          return res.status(400).json({
            message: "User is already verified ",
          });
        } else {
          findUser.isVerified = true;
          await findUser.save();
          res.status(200).json({
            success: true,
            message: "Verify successfully done",
          });
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "server error",
        });
      }
    },
  );
};
module.exports = {
  registrationController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  resentVerificationController,
  verifyEmailController,
};
