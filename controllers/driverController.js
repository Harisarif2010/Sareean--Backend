const Shipment = require("../models/shipmentModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel")
const Transaction = require("../models/transactionModel")
const Pickup = require("../models/pickupModel")
const Task = require("../models/taskModel");
const axios = require('axios');

const {createActivity} = require("../controllers/activityController");
require('dotenv').config();


const mongoose = require("mongoose");

const {aws} = require("../helpers/otherHelpers")
const acceptPickup = async (req, res) => {
  try {
    const {pickupid, driverid} = req.body
    let pickup = await Pickup.findById(pickupid);
    if (!pickup) {
      res.status(400).json({
        success: false,
        message: "pickup not found"
      })
      return;
    }

    let driver = await User.findOne({_id: driverid, userType: "driver"});
    if (!driver) {
      res.status(400).json({
        success: false,
        message: "driver not found"
      })
      return;
    }

    if(pickup.status != "unassigned"){
      res.status(400).json({
        success: false,
        message: "Pickup is unavaiable"
      })
      return;
    }

    await pickup.updateOne({
      status: "intransit"
    });
    
    var task = await Task.create({
      driverid,
      pickupid
    })

    await driver.updateOne({
      $push: {
        driverTasks: task._id
      }
    })

    res.status(200).json({
      success: true,
      message: "pickup added to tasks",
      task
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
const getDriverTasks = async (req, res) => {
  try {
    const {driverid} = req.params;
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(driverid),
          userType: "driver"
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "driverTasks",
          foreignField: "_id",
          as: "tasks"
        }
      },
      {
        $unwind: "$tasks"
      },
      {
        $lookup: {
          from: "pickups",
          localField: "tasks.pickupid",
          foreignField: "_id",
          as: "shipmentDetails"
        }
      },
      {
        $addFields: {
          "tasks": {
            $mergeObjects: [
              "$tasks",
              { $arrayElemAt: ["$shipmentDetails", 0] }
            ]
          }
        }
      }, 
      {
        $lookup: {
          from: "users",
          localField: "tasks.userid", // now using userid from shipmentDetails
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $addFields: {
          "tasks": {
            $mergeObjects: [
              "$tasks",
              { $arrayElemAt: ["$userDetails", 0] } // Merge the user details into the task object
            ]
          }
        }
      },
      {
        $project: {
          "tasks.username": 1,
          "tasks.deliveryType": 1,
          "tasks.pickupid": 1,
          "tasks.pickupLocation": 1,
          "tasks.shipments": 1,
          "tasks.createdAt": 1
        }
      },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          tasks: { $push: "$tasks" }
        }
      }
    ]
    
    let tasks = await User.aggregate(pipeline)
    if (!tasks) {
      throw Error("Driver Not Found");
    }

    var data = [];
    if(tasks.length > 0){
      data = tasks[0].tasks;
    }

    res.status(200).json({
      success: true,
      message: "fetched tasks successfully",
      tasks: data
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
module.exports = {
  getDriverTasks,
  acceptPickup
};