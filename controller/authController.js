const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const { mailVerification } = require("../utils/email");
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
  console.log(existinguser);

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
      confirmPassword: confirmPassword,
      terms: terms,
    });
    await user.save();

    const token = tokenGenarator(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      "1d",
    );

    await mailVerification(token, email);
    console.log(mailVerification);

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
    console.log("Body password:", password);
    console.log("User:", user);
    console.log("DB password:", user?.password);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};
const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  emptyFieldValidation(res, email);

  const user = await existingData(res, { email: email });
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

  resetPassword(token, email);
  return res.status(201).json({
    success: true,
    message: "Please check your email",
  });
};
const resetPasswordController = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.params;

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Password did not match",
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.send({ message: "unauthorized" });
    } else {
      const hash = bcrypt.hashSync(newPassword, 10);
      const updateData = User.findByIdAndUpdate(
        { _id: decoded.id },
        { password: hash },
      );
      res.status({ message: "Password Upload" });
    }
  });
};
const resentVerificationController = async (req, res) => {
  const { email } = req.body;
  const user = User.findOne({ email: email });
  const token = tokenGenarator(
    {
      id: user_id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    "1d",
  );
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
