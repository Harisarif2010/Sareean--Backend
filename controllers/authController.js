const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const UnderSignup = require("../models/underSignupModel");
const {is} = require("../helpers/otherHelpers")

const nodemailer = require("nodemailer");

// const twilio = require("twilio");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const crypto = require("crypto");
const qs = require("querystring");
const validator = require('validator');



require("dotenv").config();

const randomName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const godaddyEmail = process.env.EMAIL;
const godaddyPassword = process.env.PASSWORD;

const mailTransport = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  auth: {
    user: godaddyEmail,
    pass: godaddyPassword,
  },
  secureConnection: true,
  tls: { ciphers: "SSLv3" },
});

async function sendMail(otp, email) {
  try {
    const mailOptions = {
      from: godaddyEmail,
      to: email,
      subject: "Packers and Movers OTP for SignUp",
      text: `Dear user!,
            
Your One-Time Password (OTP) for SignUp is ${otp}. Do not share with anyone.
          
Team Packers and Movers`,
    };

    await mailTransport.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
}

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_String);
};

const loginUser = async (req, res) => {
  const { email, password, userType } = req.body;
  try {
    if (!email || !password || !userType) {
      throw Error("All Fields must be filled");
    }
    var user = await User.findOne({ 
      $or: [
        {email, userType},
        {phone: email, userType}
      ]
     });

    if (!user) {
      throw Error("User Not Found");
    }

    if (!user.password) {
      throw Error("Please complete your signup");
    }

    const token = createToken(user._id);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw Error("Incorrect Password");
    }

    const userObject = user.toObject();
    delete userObject.password;

    url = user.profilePic || "";
    res.status(200).json({ user: userObject, token, url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
const signupUser = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const existsEmail = await User.findOne({ 
      $or: [
        {email},
        {phone: email}
      ]
     });

    if (existsEmail) {
      throw Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const otp = OTP();
    const otpDoc = await UnderSignup.findOne({ 
      $or: [
        {email},
        {phone: email}
      ]
     });
    if (otpDoc) {
      await otpDoc.deleteOne();
    }
    var otpValue = {
      password: hashed,
      email: "",
      phone: "",
      otp,
      userType
    }
    var primaryType = "";
    if(validator.isEmail(email)){
      primaryType = "email"
      otpValue.email = email
    }else if(validator.isMobilePhone(email, 'any')){
      primaryType = "phone"
      otpValue.phone = email
    }else{
      throw Error("Invalid email or phone formate")
    }

    if(primaryType == "email"){
      await sendMail(otp, email);
    }else if(primaryType == "phone"){
      var body = `Your Packers and Movers verification code is ${otp}`;
      res.status(400).json({
        success: false,
        message: "please give otp sending mode",
      });
      return;
      // const message = await client.messages.create({
      //   body: body,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: email,
      // });
      if (message.body.error_code != null) {
        res.status(400).json({
          success: false,
          message: message.body.error_message,
        });
        throw Error("Error sending message: " + message.body.error_message);
      }
    }
    
    await UnderSignup.create(otpValue);

    res.status(200).json({
      message: "SignUp Pending. OTP Sent",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email;
    let otp = req.body.otp;
    otp = parseInt(otp, 10);
    const otpDoc = await UnderSignup.findOne({ 
      $or: [
        {email},
        {phone: email}
      ]
     });

    if (otpDoc.otp == otp) {
      const phone = otpDoc.phone;
      const email = otpDoc.email;
      const password = otpDoc.password;
      const userType = otpDoc.userType;
      const user = await User.create({
        phone,
        email,
        password,
        userType
      });
      const wallet = await Wallet.create({ userid: user._id });
      await user.updateOne({
        walletid: wallet._id,
      });
      await otpDoc.deleteOne();
      res.status(200).json({
        message: "Sign Up Successfull",
        _id: user._id
      });
    } else {
      throw Error("Otp Verification Failed");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

function OTP() {
  const max = 9999; // Maximum 4-digit number
  const min = 1000; // Minimum 4-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const resendOTP = async (req, res) => {
  try {
    const email = req.body.email;
    const otpDoc = await UnderSignup.findOne({
      $or: [
        {email},
        {phone: email}
      ]
    });

    if (!otpDoc) {
      throw Error("Sign Up Again");
    }

    const otp = OTP();

    await otpDoc.updateOne({
      otp,
    });

    // const username = otpDoc.username;

    // await sendMail(otp, username, email);

    res.status(200).json({
      message: "OTP Resent",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const resetPasswordRequest = async (req, res) => {
  try {
    const phone = req.body.phone;
    const user = await User.findOne({ phone });
    if (!user) {
      throw Error("User Not Found");
    }

    const otp = OTP();

    await UnderSignup.create({ phone, otp });

    // await sendMail(otp, user.username, phone);

    res.status(200).json({
      message: "Verification Pending. OTP Sent",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

const verifyPasswordOtp = async (req, res) => {
  try {
    const phone = req.body.phone;
    const otp = req.body.otp;

    const user = await User.findOne({ phone });
    if (!user) {
      throw Error("User Not Found");
    }

    const otpDocument = await UnderSignup.findOne({ phone, otp });

    if (otpDocument) {
      res.status(200).json({
        success: true,
        message: "Verification Successful",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Verification Failed",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const newPassword = async (req, res) => {
  try {
    const phone = req.body.phone;
    const user = await User.findOne({ phone });
    if (!user) {
      throw Error("User Not Found");
    }
    const newpassword = req.body.newpassword;
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newpassword, salt);
    await user.updateOne({
      password: hashed,
    });
    res.status(200).json({
      message: "Password Reset",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const resendPasswordOTP = async (req, res) => {
  try {
    const phone = req.body.phone;
    const otpDoc = await UnderSignup.findOne({ phone });

    if (!otpDoc) {
      throw Error("Request Change Password Again");
    }

    const otp = OTP();

    await otpDoc.updateOne({
      otp,
    });

    const user = await User.findOne({ phone });
    // let username;

    // if (user) {
    //   username = user.username;
    // }

    // await sendMail(otp, username, email);

    res.status(200).json({
      message: "OTP Resent",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const setFcmToken = async (req, res) => {
  try {
    const { userid, fcmtoken } = req.body;
    const user = await User.findById(userid);

    if (!user) {
      throw Error("User Not Found");
    }

    if (!user.fcmtoken.includes(fcmtoken)) {
      await user.updateOne({
        $push: { fcmtoken },
      });
    }

    res.status(200).json({
      message: "Token Added",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const deleteFcmToken = async (req, res) => {
  try {
    const { userid, fcmtoken } = req.body;
    const user = await User.findById(userid);

    if (!user) {
      throw Error("User Not Found");
    }

    if (user.fcmtoken.includes(fcmtoken)) {
      await user.updateOne({
        $pull: { fcmtoken },
      });
    }

    res.status(200).json({
      message: "Token Deleted",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  signupUser,
  setFcmToken,
  deleteFcmToken,
  loginUser,
  verifyOTP,
  resendOTP,
  resetPasswordRequest,
  verifyPasswordOtp,
  newPassword,
  resendPasswordOTP
};
