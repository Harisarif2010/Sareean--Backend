const User = require("../models/userModel");
const Shipment = require("../models/shipmentModel");
// const Wallet = require("../models/walletModel");
require('dotenv').config();
const OtpPass = require("../models/otpPassModel");
const {tryCatch, error, validateUser} = require("../helpers/otherHelpers")
const Wallet = require("../models/walletModel")
const Transaction = require("../models/transactionModel")


const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const {is, aws} = require("../helpers/otherHelpers")

const crypto = require("crypto");
const bcrypt = require("bcrypt");

require("dotenv").config();

bucketName = process.env.BUCKET_NAME;
bucketRegion = process.env.BUCKET_REGION;
accessKey = process.env.ACCESS_KEY;
secretAccessKey = process.env.SECRET_ACCESS_KEY;

const randomName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

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

const getUserById = async (req, res) => {
  try {
    const userid = req.params.userid;
    let user = await User.findById(userid).select("-password");
    if (!user) {
      throw Error("User Not Found");
    }

    user = user.toObject();
    // user.profilePic = await aws.getLinkFromAWS(user.profilePic);
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const getProfilePic = async (req, res) => {
  try {
    const userid = req.params.userid;

    let url = await getPicUrl(userid);

    res.status(200).json({
      url,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const getPicUrl = async (id) => {
  try {
    let user = await User.findById(id);
    if (!user) {
      return("user deleted")
    }
    // return await aws.getLinkFromAWS(user.profilePic);
    return user.profilePic;
  } catch (error) {
    throw error.message;
  }
};

const setProfilePic = async (req, res) => {
    try {
        const {userid} = req.body
      let user = await User.findById(userid);
      if (!user) {
        return("user deleted")
      }
  
      let profilePic = "";
      if (req.file) {
        profilePic = await is.upload(req.file);
        await user.updateOne({
            profilePic: profilePic
        })
      }
      res.status(200).json({
        profilePic
      })
    } catch (error) {
      res.status(400).json({
        error: error.message
      })
    }
  };

async function sendMail(otp, username, email) {
  try {
    const mailOptions = {
      from: godaddyEmail,
      to: email,
      subject: "imFact OTP To Reset Password",
      text: `Dear ${username},
            
Your One-Time Password (OTP) to reset your password is ${otp}. Do not share with anyone.
          
Team imFact`,
    };

    await mailTransport.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
  }
}

const deleteUser = async (req, res) => {
  try {
    var {userid} = req.body;
    var user = await User.findById(userid);
    if(user){
      await user.deleteOne();
      var models = [Activity, Wallet];
      await Promise.all(
        models.map(async model => {
          var modelDatas = await model.find({
            $or: [
              { userid: userid },
              { otheruserid: userid }
            ]          
          })
          await Promise.all(
            modelDatas.map(async modelData => {
              await modelData.deleteOne();
              console.log("model: ", model, ", Model data: ", modelData);
            })
          )
        })
      )
    }
      res.status(200).json({
        message: "User deleted successfully"
      });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
}

const generateShareableProfileLink = async (req, res) => {
  const userId = req.params.userId;
  var user = await User.findById(userId);
  if(user){
    const deepLink = `${process.env.BASE_URL}/OtherProfileView/${userId}`;
    res.send({ deepLink });
  }else{
    res.send("Invalid userid");
  }
}

const deleteUserByUsername = async (req, res) => {
    try {
        var {username} = req.body;
        var user = await User.findOne({username});
        if(user){
            var userid = user._id;
          await user.deleteOne();
          var models = [Activity, Wallet];
          await Promise.all(
            models.map(async model => {
              var modelDatas = await model.find({
                $or: [
                  { userid: userid },
                  { otheruserid: userid }
                ]          
              })
              await Promise.all(
                modelDatas.map(async modelData => {
                  await modelData.deleteOne();
                  console.log("model: ", model, ", Model data: ", modelData);
                })
              )
            })
          )
        }
          res.status(200).json({
            message: "User deleted successfully"
          });
      } catch (err) {
        res.status(400).json({
          error: err.message
        });
      }
}

const changePassword = async (req, res) => {
    try {
      const { userid, newpassword } = req.body;

      const user = await User.findById(userid);

      if (!user) {
        throw Error("User Not Found");
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newpassword, salt);

      await user.updateOne({
        password: hashed,
      });

      res.status(200).json({
        message: "Password Changed",
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

const searchUsers = async (req, res) => {
  try {
    const search = req.body.search || "";
    const { pageNo, perPage, userid} = req.body;
    let users;
      users = await User.find({
        username: { $regex: search, $options: "i" },
      })
        .select("-password")
        .skip((pageNo - 1) * perPage)
        .limit(perPage);

    users = await Promise.all(
      users.map(async (user) => {
        user = user.toObject();
        const url = await getPicUrl(user._id);
        user.profilePic = url;
        return user;
      })
    );

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

const transUsers = async (data)=>{
  if(Array.isArray(data)){
    data = await Promise.all(
      data.map(async (user) => {
        user = user.toObject();
        const url = await getPicUrl(user._id);
        // user.profilePic = await aws.getLinkFromAWS(url);
        return user;
      })
    )
  }else{
    data = data.toObject();
    const url = await getPicUrl(data._id);
    // data.profilePic = await aws.getLinkFromAWS(url);
  }
  return data
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users: await transUsers(users) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

  const setUserInfo = async (req, res) => {
    try{
        // basic stage optionals
        var { 
            userid,
            username,
            profileTitle,
            profileDescription,
            tags,
            activityCategories,
            address,
            shoppingMall,
            youtube,
            instagram, 
            twitter,
            tiktok,
            naver,
            service
        } = req.body;

        var user = await User.findById(userid);
        if(!user){
            throw Error("User not Found!")
        }

        var updateData = {};
        if(username){
            const existsUsername = await User.findOne({ username });
    
            if (existsUsername && user.username != username) {
            throw Error("Username already in use");
            }

            updateData["username"] = username
        }

        if(service){
          if(typeof service == "string")
            service = JSON.parse(service);

          if(service.type){
            if(service.type == "offline"){
              if(!service.businessName){
                throw Error("In online service, businessName is required");
              }
              if(!service.storeAddress){
                throw Error("In online service, storeAddress is required");
              }
            }else if(service.type == "online"){
              if(!service.serviceName){
                throw Error("In online service, serviceName is required");
              }
              if(!service.url){
                throw Error("In online service, url is required")
              }
            }else{
              throw Error("Please enter valid service type one of 'offline' or 'online'");
            }
          }else{
            throw Error("Please specify service type")
          }
          
          updateData["service"] = service;
        }

        if(profileTitle){
            updateData['profileTitle'] = profileTitle
        }

        if(profileDescription){
            updateData['profileDescription'] = profileDescription
        }

        if(tags){
            // var prevTags = user.tags;
            // await Promise.all(
            //     tags.map(tag => {
            //         if(!prevTags.includes(tag)){
            //             prevTags.push(tag);
            //         }
            //     })
            // )
            // await Promise.all(
            //     prevTags.map(tag => {
            //         if(!tags.includes(tag)){
            //             prevTags.pull(tag);
            //         }
            //     })
            // )
            updateData['tags'] = tags
        }

        if(activityCategories){
            // var prevactivityCategories = user.activityCategories;
            // await Promise.all(
            //     activityCategories.map(activityCategorie => {
            //         if(!prevactivityCategories.includes(activityCategorie)){
            //             prevactivityCategories.push(activityCategorie);
            //         }
            //     })
            // )
            updateData['activityCategories'] = activityCategories
        }

        if(address){
            updateData['address'] = address
        }

        if(shoppingMall){
            updateData['shoppingMall'] = shoppingMall
        }

        var social = false;
        if(youtube && youtube != ""){
            social = true;
            var youtubeData = user.youtube
            updateData['youtube'] = youtubeData
            if(!updateData['youtube']){
                updateData['youtube'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!youtube.subscribers && !youtubeData.subscribers){
                throw Error("Please provide youtube subscribers")
            }
            console.log("updatedata: ", updateData);
            console.log("yotube data: ", youtube);
            updateData.youtube.subscribers = youtube.subscribers
            if(!youtube.address && !youtubeData.address){
                throw Error("Please provide youtube account address")
            }
            updateData.youtube.address = youtube.address
            if(!youtube.contentLink && !youtubeData.contentLink){
                throw Error("Please provide youtube representative content link")
            }
            updateData.youtube.contentLink = youtube.contentLink
            
            
            if(!youtube.accountName && !youtubeData.accountName){
              throw Error("Please provide youtube Acount Name ")
            }
            updateData.youtube.accountName = youtube.accountName
            
        }
        if(instagram && instagram != ""){
          social = true;
            var instagramData = user.instagram
            updateData['instagram'] = instagramData
            if(!updateData['instagram']){
                updateData['instagram'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!instagram.subscribers && !instagramData.subscribers){
                throw Error("Please provide instagram subscribers")
            }
            updateData.instagram.subscribers = instagram.subscribers
            if(!instagram.address && !instagramData.address){
                throw Error("Please provide instagram account address")
            }
            updateData.instagram.address = instagram.address
            if(!instagram.contentLink && !instagramData.contentLink){
                throw Error("Please provide instagram representative content link")
            }
            updateData.instagram.contentLink = instagram.contentLink
            
            if(!instagram.accountName && !instagramData.accountName){
              throw Error("Please provide instagram Acount Name ")
            }
            updateData.instagram.accountName = instagram.accountName
        } 
        if(twitter && twitter != ""){
          social = true;
            var twitterData = user.twitter
            updateData['twitter'] = twitterData
            if(!updateData['twitter']){
                updateData['twitter'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!twitter.subscribers && !twitterData.subscribers){
                throw Error("Please provide twitter subscribers")
            }
            updateData.twitter.subscribers = twitter.subscribers
            if(!twitter.address && !twitterData.address){
                throw Error("Please provide twitter account address")
            }
            updateData.twitter.address = twitter.address
            if(!twitter.contentLink && !twitterData.contentLink){
                throw Error("Please provide twitter representative content link")
            }
            updateData.twitter.contentLink = twitter.contentLink

            
            if(!twitter.accountName && !twitterData.accountName){
              throw Error("Please provide twitter Acount Name ")
            }
            updateData.twitter.accountName = twitter.accountName
        }
        if(tiktok && tiktok != ""){
          social = true;
            var tiktokData = user.tiktok
            updateData['tiktok'] = tiktokData
            if(!updateData['tiktok']){
                updateData['tiktok'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!tiktok.subscribers && !tiktokData.subscribers){
                throw Error("Please provide tiktok subscribers")
            }
            updateData.tiktok.subscribers = tiktok.subscribers
            if(!tiktok.address && !tiktokData.address){
                throw Error("Please provide tiktok account address")
            }
            updateData.tiktok.address = tiktok.address
            if(!tiktok.contentLink && !tiktokData.contentLink){
                throw Error("Please provide tiktok representative content link")
            }
            updateData.tiktok.contentLink = tiktok.contentLink

            if(!tiktok.accountName && !tiktokData.accountName){
              throw Error("Please provide tiktok Acount Name ")
            }
            updateData.tiktok.accountName = tiktok.accountName
        }
        if(naver && naver != ""){
          social = true;
            var naverData = user.naver
            updateData['naver'] = naverData
            if(!updateData['naver']){
                updateData['naver'] = {
                    subscribers: null,
                    address: null,
                    contentLink: null,
                    accountName: null
                }
            }
            if(!naver.subscribers && !naverData.subscribers){
                throw Error("Please provide naver subscribers")
            }
            updateData.naver.subscribers = naver.subscribers
            if(!naver.address && !naverData.address){
                throw Error("Please provide naver account address")
            }
            updateData.naver.address = naver.address
            if(!naver.contentLink && !naverData.contentLink){
                throw Error("Please provide naver representative content link")
            }
            updateData.naver.contentLink = naver.contentLink

            if(!naver.accountName && !naverData.accountName){
              throw Error("Please provide naver Acount Name ")
            }
            updateData.naver.accountName = naver.accountName
        }

        updateData['signupStatus'] = user.signupStatus;
        if(!user.signupStatus.includes("basic")){
          updateData['signupStatus'].push("basic")
        }
        if(!user.signupStatus.includes("social") && social){
          updateData['signupStatus'].push("social")
        }
        await user.updateOne(updateData);
        res.status(200).json({
            message: "User Info Updated"
        })
        // basic stage optionals end
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
  }

  // const setUserBank = async (req, res) => {
  //   try{
  //       // basic stage optionals
  //       var { 
  //           userid,
  //           name,
  //           number,
  //           type
  //       } = req.body;

  //       var user = await User.findById(userid);
  //       if(!user){
  //           throw Error("User not Found!")
  //       }

  //       var updateData = {};
  //       if(name){
  //           updateData["name"] = name
  //       }

  //       if(number){
  //           updateData['number'] = number
  //       }

  //       if(type){
  //           updateData['type'] = type
  //       }

  //       await user.updateOne({
  //         bank: updateData
  //       });
  //       updateData = {};
  //       if(!user.signupStatus.includes("bank")){
  //         updateData['signupStatus'] = user.signupStatus;
  //         updateData['signupStatus'].push("bank")
  //       }
  //       await user.updateOne(updateData);
  //       res.status(200).json({
  //           message: "User Bank Updated"
  //       })
  //       // basic stage optionals end
  //   }catch(err){
  //       res.status(400).json({
  //           error: err.message
  //       })
  //   }
  // }

const getUserProfile = async (req, res) => {
  const {userid} = req.params;
  var user = await User.findById(userid);
  if(!user){
    throw Error("User not Found");
  }

  var updatedUser = user.toObject();
  updatedUser.dob = new Date(updatedUser.dob);
  delete updatedUser.password
  delete updatedUser.walletid
  delete updatedUser.fcmtoken

  res.status(200).json(updatedUser);
}

const editProfile = async (req, res) => {
  try{
    var {
      userid,
      phone,
      address,
      country,
      city,
      licenseNumber,
      licenseIssueDate,
      licenseNationality,
      vehicleNumber,
      vehicleCountry,
      vehicleName,
      vehicleCategory,
      bankName,
      holderName,
      bankAccountNumber,
      username,
      businessName,
      areaCode,
      primaryAddress,
      neighborhood,
      plusCodes,
      email,
      accountType

    } = req.body;
    var updatedData = {};
    function newData(data){
        var keys = Object.keys(data);
        keys.forEach(key => {
            updatedData[key] = data[key]
        })
    }
  
    var user = await User.findById(userid);
    if(!user){
      res.status(400).json({
        success: false,
        message: "User Not Found!"
      })
      return;
    }
    if(phone){
      newData({phone});
    }
  
    if(address){
      newData({address})
    }
  
    if(country){
      newData({country})
    }
  
    if(city){
      var error = false;
      async function getCityFromLocation(location) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.GOOGLE_API}`;
        
        try {
          const response = await axios.get(url);
          const data = response.data;
      
          if (data.status === 'OK') {
            const results = data.results[0].address_components;
            
            for (let component of results) {
              if (component.types.includes('locality')) {
                return component.long_name;
              }
            }
          } else {
            response.status(400).json({
              success: false,
              response: `Geocoding failed: ${data.status}`
            })
            error = true;
            return null;
          }
        } catch (error) {
          response.status(400).json({
            success: false,
            response: `Geocoding failed: ${data.status}`
          })
          error = true;
          return null;
        }
      }
      if(error){
        return;
      }
      newData({city: await getCityFromLocation(city)})
    }

    if(req.files['licenseFront']){
        var contentName = await is.upload(req.files['licenseFront'][0]);
        newData({"license.front": contentName})
    }

    if(req.files['licenseBack']){
      var contentName = await is.upload(req.files['licenseBack'][0]);
      newData({"license.back": contentName})
    }

    if(licenseNumber){
      newData({"license.number": licenseNumber})
    }
    if(licenseIssueDate){
      var date = licenseIssueDate;
      if(typeof date == "string"){
        date = new Date(date);
      }
      newData({"license.issueDate": date})
    }

    if(licenseNationality){
      newData({"license.nationality": licenseNationality})
    }

    if(vehicleNumber){
      newData({"vehicle.number": vehicleNumber})
    }
    if(vehicleCountry){
      newData({"vehicle.country": vehicleCountry})
    }
    if(vehicleName){
      newData({"vehicle.name": vehicleName})
    }
    if(vehicleCategory){
      newData({"vehicle.category": vehicleCategory})
    }

    if(bankName){
      newData({"bank.bank": bankName})
    }
    if(holderName){
      newData({"bank.name": holderName})
    }
    if(bankAccountNumber){
      newData({"bank.number": bankAccountNumber})
    }
    if(username){
      newData({username})
    }
    if(businessName){
      newData({businessName})
    }
    if(areaCode){
      newData({areaCode})
    }
    if(primaryAddress){
      newData({primaryAddress})
    }
    if(neighborhood){
      newData({neighborhood})
    }
    if(plusCodes){
      if(typeof plusCodes == "string"){
        plusCodes = JSON.parse(plusCodes);
      }
      newData({plusCodes})
    }
    if(email){
      newData({email})
    }
    if(accountType){
      newData({accountType})
    }    
    await user.updateOne(updatedData);
  
    res.status(200).json({
      success: true,
      message: "Updated profile successfully!"
    })
  }catch(err){
    res.status(400).json({
      success: false,
      message: err.message
    })
    console.log(err);
  }
}

const getUserTransactionHistory = async (req, res) => {
  try{
    const {
      userid
    } = req.params;
  
    var user = await User.findById(userid);
    if(!user){
      res.status(400).json({
        success: false,
        message: "user not found"
      })
      return;
    }
    
    var userWallet = await Wallet.findById(user.walletid);
    if(!userWallet){
      res.status(500).json({
        success: false,
        message: "user wallet not found"
      })
      return;
    }

    var transactions = [];
    transactions = await Promise.all(
      userWallet.history.map(async historyid => {
        var transaction = await Transaction.findById(historyid);
        transaction = transaction.toObject();
        return await Shipment.findById(transaction.orderid.toString());
      })
    )

    res.status(200).json({
      success: true,
      transactions
    })
    
  } catch (error) {
    console.error("Error adding shipments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
module.exports = {
    getProfilePic,
    setProfilePic,
    getUserById,
    deleteUser,
    deleteUserByUsername,
    generateShareableProfileLink,
    searchUsers,
    changePassword,
    getAllUsers,
    setUserInfo,
    getUserProfile,
    editProfile,
    getUserTransactionHistory,
    getPicUrl
};