const Activity = require("../models/activityModel");
const User = require("../models/userModel");
const Pickup = require("../models/pickupModel");
const {sendNotification} = require("../controllers/notificationController")
const {aws} = require("../helpers/otherHelpers")

const createActivity = async (
  userid,
  text,
  pickupid,
  otheruserid,
  notification = null
) => {
  console.log({
    userid,
    text,
    pickupid,
    otheruserid,
    notification
  })
  try {
    const user = await User.findById(userid);
    
    if (!user) {
      throw Error("User Not Found");
    }
    var pickup;
    var otheruser;
    if(otheruserid){
      otheruser = await User.findById(otheruserid);
      if (!otheruser) {
        throw Error("User Not Found");
      }
  
      await Activity.create({
        userid,
        otheruserid,
        text
      });
    }else if(pickupid){
      pickup = await Pickup.findById(pickupid);
      if (!pickup) {
        throw Error("pickup Not Found");
      }
  
      await Activity.create({
        userid,
        text,
        pickupid
      });
    }

    if(notification){
      if(pickup){
        sendNotification(userid, "New pickup request", text, notification.type, pickupid)
      }
    }

    // var socketActivity = global.onlineSockets.get(sender._id.toString());

    // if (socketActivity) {
    //   var unreadCount = await Activity.countDocuments({otheruserid: userid, read: false})
    //   for (const socket of socketActivity) {
    //     if (socket) {
    //       socket.emit("unreadActivitiesCount", {
    //         count: unreadCount
    //       });
    //     }
    //   }
    // }
  } catch (error) {
    console.error(error);
  }
};


const deleteActivity = async (
  req, res
) => {
  try {
    const {activityid} = req.body;
    await Activity.deleteOne({
      _id: activityid
    });

    res.status(200).json({
      message: "Activity delete successfully"
    });
  } catch (error) {
    console.error(error);
  }
};

const getActivities = async (req, res) => {
  try {
    const userid = req.params.userid;
    const user = await User.findById(userid);
    if (!user) {
      throw Error("User Nots Found");
    }
    let activities = await Activity.find({ userid })
      .sort({ createdAt: "desc" })
      .select("_id");

    activities = await Promise.all(
      activities.map((id) => {
        return getActivity(id);
      })
    );

    res.status(200).json({
      activities,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const { getPicUrl } = require("./userController");

const getActivity = async (id) => {
  let activity = await Activity.findById(id);

  try {
    if (!activity) {
      throw Error("Activity Not Found");
    }
    activity = activity.toObject();

    var otherUser = null ;
    var otherUserProfilePic = null;
    if(activity.otheruserid){
      otherUser = await User.findById(activity.otheruserid);
      otherUserProfilePic = await getPicUrl(activity.otheruserid);
      if(otherUser){
        activity.otherUsername = otherUser.username;
      }
      activity.otherUserProfilePic = otherUserProfilePic;
    }
    

    const userProfilePic = await getPicUrl(activity.userid);
    activity.userProfilePic = userProfilePic;
    activity.text = activity.text;

    if (activity.pickupid) {
      const pickup = await Pickup.findById(activity.pickupid);
      if (pickup) {
        activity.title = "New pickup request"
        activity.body = activity.text
      }
    }

    return activity;
  } catch (error) {
    console.error(error);
    console.log(activity);
  }
};

const markAsRead = async (req, res) => {
  try{
  var {userid} = req.body;
  var activities = await Activity.find({
    otheruserid: userid,
    read: false
  });

  await Promise.all(
    activities.map(async activity =>{
      await activity.updateOne({
          read: true
      })
    })
  )

  res.status(200).json({
    message: "chat read"
  })
}catch(err){
  res.status(400).json({
    message: err.message
  })
}
}

const getUnreadCount = async (req, res) => {
  try{
      const userid = req.params.userid
  var activities = await Activity.countDocuments({
    otheruserid: userid,
    read: false
  });
 
  res.status(200).json({
    count: activities
  })
}catch(err){
  res.status(400).json({
    message: err.message
  })
}
}


module.exports = { createActivity, getActivities, deleteActivity,markAsRead,getUnreadCount };
