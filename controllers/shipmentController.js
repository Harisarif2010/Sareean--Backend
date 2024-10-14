const Shipment = require("../models/shipmentModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel")
const Transaction = require("../models/transactionModel")
const Pickup = require("../models/pickupModel")
const axios = require('axios');

const Agenda = require('agenda');
const {createActivity} = require("../controllers/activityController");
// const Wallet = require("../models/walletModel");
require('dotenv').config();


const mongoose = require("mongoose");

const agenda = new Agenda({ db: { address: process.env.DATABASE_URL } });

agenda.define('processPickupSchedule', async (job) => {
  const { pickup} = job.attrs.data;

  var drivers = await User.find({userType: "driver", accountStatus: "approved", city: pickup.pickupLocation});
  if(drivers.length == 0){
    drivers = await User.find({userType: "driver", accountStatus: "approved"});
  }
  await Promise.all(
    drivers.map(async driver => {
      await createActivity(driver._id, "Pickup id: "+pickup.pickupid, pickup._id, undefined, {type: "pickup-request"})
    })
  )
  await Pickup.updateOne({pickupid: pickup.pickupid}, {
    status: "unassigned",
    scheduleTime: null
  })
  console.log(`Processing shipment with ID: ${pickup.pickupid}`);
});


(async function () {
  await agenda.start();
})();

const {aws} = require("../helpers/otherHelpers")
const getShipmentById = async (req, res) => {
  try {
    const orderid = req.params.orderid;
    let shipment = await Shipment.findOne({orderid})
    if (!shipment) {
      throw Error("Shipment Not Found");
    }

    shipment = shipment.toObject();
    res.status(200).json({
      shipment,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
const getShipmentPrice = async (req, res) => {
  try {
    const orderid = req.params.orderid;
    let shipment = await Shipment.findOne({orderid})
    if (!shipment) {
      throw Error("Shipment Not Found");
    }

    shipment = shipment.toObject();
    res.status(200).json({
      shipmentPrice: shipment.price
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
const deleteShipment = async (req, res) => {
  try {
    var {shipmentid} = req.body;
    var shipment = await Shipment.findById(shipmentid);
    if(shipment){
      await shipment.deleteOne();
    }
      res.status(200).json({
        message: "Shipment deleted successfully"
      });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
}
const searchShipments = async (req, res) => {
  try {
    const search = req.body.search || "";
    const { pageNo, perPage, userid} = req.body;
    if(!pageNo){
      pageNo = 1
    }
    if(!perPage){
      perPage = 10
    }
    let shipments;
    shipments = await Shipment.find({
      $or: [
        {
          from: { 
            $regex: search, 
            $options: "i" 
          },
        },
        {
          to: {
            $regex: search, 
            $options: "i"
          }
        },
        {
          receiverName: {
            $regex: search,
            $options: "i"
          }
        },
        {
          kilograms: {
            $regex: search,
            $options: "i"
          }
        },
        {
          deliverySpeed: {
            $regex: search,
            $options: "i"
          }
        }
      ]
    })
    .skip((pageNo - 1) * perPage)
    .limit(perPage);

    var newShipments = [];
    shipments = await Promise.all(
      shipments.map(async (shipment) => {
        shipment = shipment.toObject();
        if(shipment.userid == userid){
          newShipments.push(shipment);
        }
      })
    );

    res.status(200).json({
      newShipments,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}
const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find()
    if (!shipments || shipments.length === 0) {
      return res.status(404).json({ message: "No shipments found" });
    }
    res.status(200).json({ shipments });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const addShipment = async(req, res) => {
  try{
    const{
      userid,
      from,
      to,
      kilograms,
      deliverySpeed,
      receiverName,
      phone,
      price,
    } = req.body;
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

    if(deliverySpeed){
      if(!["standard", "express", "same-day"].includes(deliverySpeed)){
        res.status(400).json({
          success: false,
          message: "delivery speed could be 'standard', 'express', 'same-day'"
        })
        return;
      }
    }
    if(kilograms){
      if(!["1-5", "5-10", "10-15", "15-20"].includes(kilograms)){
        res.status(400).json({
          success: false,
          message: "kilograms could be '1-5', '5-10', '10-15', '15-20'"
        })
        return;
      }
    }

    var orderid = "";
    do{
      orderid = getRandomString();
    }while(orderid.trim() != "" && await Shipment.findOne({orderid}))
    var shipment = await Shipment.create({
      userid,
      from,
      to,
      kilograms,
      deliverySpeed,
      receiverName,
      phone,
      price,
      orderid: getRandomString()
    })

    await user.updateOne({
      $push: {
        shipments: shipment._id
      }
    })

    var transaction = await Transaction.create({
      userid,
      orderid: shipment._id,
      amount: price
    });

    await userWallet.updateOne({
      $push: {
        history: transaction._id
      }
    })


    res.status(200).json({
      success: true,
      shipment,
      message: "Shipment added successfully"
    })
  } catch (error) {
    console.error("Error adding shipments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const cancelShipment = async(req, res) => {
  try{
    const{
      orderid,
      userid
    } = req.body;
    var user = await User.findById(userid);
    if(!user){
      res.status(400).json({
        success: false,
        message: "user not found"
      })
      return;
    }

    var shipment = await Shipment.findOne({orderid});
    if(!shipment){
      res.status(400).json({
        success: false,
        message: "shipment not found"
      })
      return;
    }

    if(!user.shipments.includes(shipment._id)){
      res.status(500).json({
        success: false,
        message: "shipment not created yet"
      })
      return;
    }

    await user.updateOne({
      $pull: {
        shipments: shipment._id
      }
    })

    await shipment.deleteOne()

    res.status(200).json({
      success: true,
      message: "Shipment cancelled successfully"
    })
  } catch (error) {
    console.error("Error adding shipments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const scheduleShipment = async(req, res) => {
  try{
    var {
      shipmentid,
      scheduleType,
      scheduleDate,
      scheduleHours
    } = req.body;
  
    var shipment = await Shipment.findById(shipmentid);
    
    if(!shipment){
      res.status(400).json({
        success: false,
        message: "shipment not found"
      })
      return;
    }
  
    if(!["date", "hours" ].includes(scheduleType)){
      res.status(400).json({
        success: false,
        message: "shedule type could be 'date' or 'hours'"
      })
      return;
    }
  
    var updatedData = {
      scheduled: true,
      scheduleType
    }
    if(scheduleType == "date"){
      if(!scheduleDate || scheduleDate.trim() == ""){
        res.status(400).json({
          success: false,
          message: "please add date for schedule type date in scheduleDate"
        })
        return;
      }
      if(typeof scheduleDate == "string"){
        scheduleDate = new Date(scheduleDate);
      }
      updatedData["scheduleDate"] = scheduleDate
    }else{
      if(!scheduleHours || scheduleHours.trim() == ""){
        res.status(400).json({
          success: false,
          message: "please add hours for schedule type hours in scheduleDate"
        })
        return;
      }
      updatedData["scheduleHours"] = scheduleHours
    }
  
    shipment = await shipment.updateOne(updatedData);

    res.status(200).json({
      success: true,
      shipment,
      message: "Shipment scheduled successfullly!"
    })
  }catch (error) {
    console.error("Error scheduling shipments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const getUserOrders = async(req, res)=>{
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
  
  var shipments = [];
  await Promise.all(
    user.shipments.map(async shipmentid => {
      var shipment = await Shipment.findById(shipmentid);
      if(shipment.status == "pending"){
        shipments.push(shipment);
      }
    })
  )

  res.status(200).json({
    success: true,
    shipments
  })

}
const getUserRequests = async(req, res)=>{
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
  
  var shipments = [];
  await Promise.all(
    user.shipments.map(async shipmentid => {
      var shipment = await Shipment.findById(shipmentid);
      if(shipment.status == "paid"){
        shipments.push(shipment);
      }
    })
  )

  res.status(200).json({
    success: true,
    shipments
  })

}
const getUserShipments = async(req, res)=>{
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
  
  var shipments = [];
  await Promise.all(
    user.shipments.map(async shipmentid => {
      var shipment = await Shipment.findById(shipmentid);
      if(!["pending", "paid"].includes(shipment.status)){
        shipments.push(shipment);
      }
    })
  )

  res.status(200).json({
    success: true,
    shipments
  })

}
const getUserPickups = async(req, res)=>{
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
  
  var pickups = await Promise.all(
    user.pickups.map(async shipmentid => {
      var shipment = await Pickup.findById(shipmentid);
      return shipment;
    })
  )

  res.status(200).json({
    success: true,
    pickups
  })

}
const payForShipment = async(req, res) => {
  try{
    const{
      orderid,
      userid
    } = req.body;
    var user = await User.findById(userid);
    if(!user){
      res.status(400).json({
        success: false,
        message: "user not found"
      })
      return;
    }

    var shipment = await Shipment.findOne({orderid});
    if(!shipment){
      res.status(400).json({
        success: false,
        message: "shipment not found"
      })
      return;
    }

    if(!user.shipments.includes(shipment._id)){
      res.status(500).json({
        success: false,
        message: "shipment not created yet"
      })
      return;
    }

    await shipment.updateOne({
      status: "paid"
    })
    
    var transaction = await Transaction.findOne({orderid: shipment._id});
    if(!transaction){
      res.status(500).json({
        success: false,
        message: "transaction for shipment not found"
      })
      return;
    }

    await transaction.updateOne({
      status: "paid"
    })

    res.status(200).json({
      success: true,
      message: "Shipment paid successfully"
    })
  } catch (error) {
    console.error("Error adding shipments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

const generateDriverRequest = async(req, res) => {
  try{
    const{
      orderids,
      userid
    } = req.body;
    var user = await User.findById(userid);
    if(!user){
      res.status(400).json({
        success: false,
        message: "user not found"
      })
      return;
    }

    var generatedRequest = await generateDriverRequestFunc(orderids, user);
    if(!generatedRequest.success){
      res.status(400).json({
        success: false,
        message: generatedRequest.response
      })
      return;
    }
    res.status(200).json({
      success: true,
      pickups: generatedRequest.response,
      message: "Driver Request Generated"
    })
  } catch (error) {
    console.error("Error generating request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const confirmDriverRequest = async(req, res) => {
  try{
    const{
      orderids,
      userid
    } = req.body;
    var user = await User.findById(userid);
    if(!user){
      res.status(400).json({
        success: false,
        message: "user not found"
      })
      return;
    }

    var generatedRequest = await generateDriverRequestFunc(orderids, user);
    if(!generatedRequest.success){
      res.status(400).json({
        success: false,
        message: generatedRequest.response
      })
      return;
    }

    var batches = generatedRequest.response;
    await Promise.all(
      batches.map(async pickup => {
        var pickupCreated = await Pickup.create({
          userid,
          pickupid: pickup.pickupid,
          pickupLocation: pickup.pickupLocation,
          shipments: pickup.shipments
        })
        pickup._id = pickupCreated._id;

        await Promise.all(
          pickup.shipments.map(async shipmentData => {
            var shipment = await Shipment.findById(shipmentData._id);
            if(shipment){
              await shipment.updateOne({
                status: "assigning"
              })
            }
          })
        )

        var drivers = await User.find({userType: "driver", accountStatus: "approved", city: pickup.pickupLocation});
        if(drivers.length == 0){
          drivers = await User.find({userType: "driver", accountStatus: "approved"});
        }
        await Promise.all(
          drivers.map(async driver => {
            await createActivity(driver._id, "Pickup id: "+pickup.pickupid, pickup._id, undefined, {type: "pickup-request"})
          })
        )

        await user.updateOne({
          $push: {
            pickups: pickup._id 
          }
        })
      })
    )

    res.status(200).json({
      success: true,
      message: "Pickup request created"
    })
  } catch (error) {
    console.error("Error generating request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
const scheduleDriverRequest = async(req, res) => {
  try{
    const{
      orderids,
      userid,
      hours
    } = req.body;
    var user = await User.findById(userid);
    if(!user){
      res.status(400).json({
        success: false,
        message: "user not found"
      })
      return;
    }

    if(!hours || typeof hours != "number"){
      res.status(400).json({
        success: false,
        message: "please provide valid shedule hours number"
      })
      return;
    }

    var generatedRequest = await generateDriverRequestFunc(orderids, user);
    if(!generatedRequest.success){
      res.status(400).json({
        success: false,
        message: generatedRequest.response
      })
      return;
    }

    var batches = generatedRequest.response;
    const delay = hours * 60 * 60 * 1000; // Convert hours to milliseconds
    // const delay = hours * 1000; // Convert hours to milliseconds
    var scheduleTime = new Date(Date.now() + delay)
    await Promise.all(
      batches.map(async pickup => {
        var pickupCreated = await Pickup.create({
          userid,
          pickupid: pickup.pickupid,
          pickupLocation: pickup.pickupLocation,
          shipments: pickup.shipments,
          status: "scheduled",
          scheduleTime
        })
        pickup._id = pickupCreated._id

        await Promise.all(
          pickup.shipments.map(async shipmentData => {
            var shipment = await Shipment.findById(shipmentData._id);
            if(shipment){
              await shipment.updateOne({
                status: "assigning"
              })
            }
          })
        )

        await user.updateOne({
          $push: {
            pickups: pickupCreated._id 
          }
        })

        await agenda.schedule(scheduleTime, 'processPickupSchedule', { pickup });
      })
    )

    res.status(200).json({
      success: true,
      message: "Pickup request scheduled"
    })
  } catch (error) {
    console.error("Error generating request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
 
// Helpers
const generateDriverRequestFunc = async(orderids, user) => {
  try{
     if(!Array.isArray(orderids)){
      return {
        success: false,
        response: "Please provide array of orderids"
      }
     }
     user = user.toObject();
     user.shipments = await Promise.all(
      user.shipments.map((shipment) => {return shipment.toString()})
     )
     var batches = [];
     var response = {
      success: true
     }
     var pickupPrevIds = await Pickup.find({}).select("pickupid");
     pickupPrevIds = pickupPrevIds.map(pickup => {
      return pickup.pickupid
     })
     await Promise.all(
      orderids.map(async orderid => {
        if(!user.shipments.includes(orderid)){
          response = {
            success: false,
            response: "Invalid orderid"
          }
          return;
        }

        var shipment = await Shipment.findOne({_id: orderid, status: "paid"});
        if(!shipment){
          response = {
            success: false,
            response: "invalid orderid or shipment is not paid yet"
          }
          return;
        }

        if(process.env.GOOGLE_API == ""){
          var batchIndex = batches.findIndex(obj => obj.pickupLocation === shipment.to);
          if(batchIndex == -1){
            var pickupid = getRandomString();
            while(batches.findIndex(obj => obj.pickupid === pickupid) != -1 || pickupPrevIds.includes(pickupid)){
              pickupid = getRandomString();
            }
            batches.push({
              pickupid,
              pickupLocation: shipment.to,
              shipments: [shipment],
              count: 1
            })
          }else{
            batches[batchIndex].shipments.push(shipment);
            batches[batchIndex].count = batches[batchIndex].shipments.length;
          }
        }else{
          var city = await getCityFromLocation(shipment.to);
          if(city == null){
            response = {
              success: false,
              response: "City not found"
            }
            return;
          }

          var batchIndex = batches.findIndex(obj => obj.pickupLocation === city);
          if(batchIndex == -1){
            var pickupid = getRandomString();
            while(batches.findIndex(obj => obj.pickupid === pickupid) != -1 || pickupPrevIds.includes(pickupid)){
              pickupid = getRandomString();
            }
            batches.push({
              pickupid,
              pickupLocation: city,
              shipments: [shipment],
              count: 1
            })
          }else{
            batches[batchIndex].shipments.push(shipment);
            batches[batchIndex].count = batches[batchIndex].shipments.length;
          }
        }
      })
     )

     if(!response.success){
      return response;
     }else{
       return {
         success: true,
         response: batches
       }
     }
  } catch (error) {
    return { success: false, response: error.message }
  }
}
function getRandomString() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  
  let randomString = "";
  for (let i = 0; i < 3; i++) {
    randomString += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  randomString += digits.charAt(Math.floor(Math.random() * digits.length));

  let remainingChars = [];
  
  let lettersToAdd = Math.floor(Math.random() * 2) + 1; 
  let digitsToAdd = 8 - lettersToAdd;

  for (let i = 0; i < lettersToAdd; i++) {
    remainingChars.push(letters.charAt(Math.floor(Math.random() * letters.length)));
  }

  for (let i = 0; i < digitsToAdd; i++) {
    remainingChars.push(digits.charAt(Math.floor(Math.random() * digits.length)));
  }

  remainingChars = remainingChars.sort(() => 0.5 - Math.random());
  randomString += remainingChars.join('');

  return randomString;
}


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
      response = {
        success: false,
        response: `Geocoding failed: ${data.status}`
      }
      return null;
    }
  } catch (error) {
    response  = {
      success: false,
      response: `Error during geocoding: ${error}`
    }
    return null;
  }
}


module.exports = {
  addShipment,
  getAllShipments,
  searchShipments,
  deleteShipment,
  getShipmentById,
  scheduleShipment,
  cancelShipment,
  getUserOrders,
  payForShipment,
  getUserRequests,
  getUserShipments,
  getShipmentPrice,
  generateDriverRequest,
  confirmDriverRequest,
  scheduleDriverRequest,
  getUserPickups
};