const User = require("../models/userModel")
const Chat = require("../models/chatModel")
const Thread = require("../models/threadModel")

const { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

require('dotenv').config()


bucketName = process.env.BUCKET_NAME
bucketRegion = process.env.BUCKET_REGION
accessKey = process.env.ACCESS_KEY
secretAccessKey = process.env.SECRET_ACCESS_KEY

const randomName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')


const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
})


const getChatHistory = async (req, res) => {
    try {
        const { userid, otherUserid } = req.body;

        let chats = await Chat.find({
            $or: [
                { senderid: userid, receiverid: otherUserid },
                { senderid: otherUserid, receiverid: userid }
            ]
        }).sort({ createdAt: 'desc' });
        let chat = []

        for (let c of chats) {
            c = c.toObject()
            c.contentURL = ""
            c.contentType = ""
            if(c.likedBy && c.likedBy.length > 0){
                c["liked"] = true;
            }else{
                c["liked"] = false;
            }
            if (c.media) {
                let getObjectParams = {
                    Bucket: bucketName,
                    Key: c.media
                }
                let command = new GetObjectCommand(getObjectParams)
                let command2 = new HeadObjectCommand(getObjectParams)
                const object = await s3.send(command2)
                const objectUrl = await getSignedUrl(s3, command, { expiresIn: "604800" })
                c.contentURL = objectUrl
                c.contentType = object.ContentType
            }
            delete c.media
            chat.push(c)
        }

        res.status(200).json({ chat });
    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}
const { getPicUrl } = require("../controllers/userController")

const getThreads = async (req, res) => {
    try {
        const userid = req.params.userid
        let threads = await Thread.find({ $or: [{ participantOneId: userid }, { participantTwoId: userid }] })

        threads = await Promise.all(
            threads.map(async (thread) => {
                const user1 = await User.findById(thread.participantOneId)
                const user2 = await User.findById(thread.participantTwoId)
                var otherUserId = thread.participantOneId;
                if(thread.participantOneId == userid){
                    otherUserId = thread.participantTwoId;
                }
                var unreadCount = await Chat.countDocuments({
                    receiverid: userid,
                    senderid: otherUserId.toString(),
                    read: false,
                  });
                return {
                    _id: thread._id,
                    participants: [{
                        userid: user1._id,
                        username: user1.username,
                        is_online: user1.is_online,
                        profilePic: await getPicUrl(user1._id)
                    }, {
                        userid: user2._id,
                        username: user2.username,
                        is_online: user2.is_online,
                        profilePic: await getPicUrl(user2._id)
                    }],
                    last_message: thread.last_message,
                    last_message_sender_id: thread.last_message_sender_id,
                    last_message_Username: thread.last_message_Username,
                    last_message_timestamp: thread.last_message_timestamp,
                    contentType: thread.contentType,
                    unreadCount
                }
            })
        )

        res.status(200).json({
            threads
        })

    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}
const getThreads2 = async (userid) => {
    try {
        let threads = await Thread.find({ $or: [{ participantOneId: userid }, { participantTwoId: userid }] })

        threads = await Promise.all(
            threads.map(async (thread) => {
                const user1 = await User.findById(thread.participantOneId)
                const user2 = await User.findById(thread.participantTwoId)
                var otherUserId = thread.participantOneId;
                if(thread.participantOneId == userid){
                    otherUserId = thread.participantTwoId;
                }
                var unreadCount = await Chat.countDocuments({
                    receiverid: userid,
                    senderid: otherUserId.toString(),
                    read: false,
                  });
                return {
                    _id: thread._id,
                    participants: [{
                        userid: user1._id,
                        username: user1.username,
                        is_online: user1.is_online,
                        profilePic: await getPicUrl(user1._id)
                    }, {
                        userid: user2._id,
                        username: user2.username,
                        is_online: user2.is_online,
                        profilePic: await getPicUrl(user2._id)
                    }],
                    last_message: thread.last_message,
                    last_message_sender_id: thread.last_message_sender_id,
                    last_message_Username: thread.last_message_Username,
                    last_message_timestamp: thread.last_message_timestamp,
                    contentType: thread.contentType,
                    unreadCount
                }
            })
        )

        return threads

    } catch (error) {
        console.log(error)
    }
}
const markAsRead = async (req, res) => {
    try{
    var {userid, otheruserid} = req.body;
    var chats = await Chat.find({
      receiverid: userid,
      senderid: otheruserid,
      read: false
    });
  
    await Promise.all(
      chats.map(async chat =>{
        await chat.updateOne({
            read: true
        })
      })
    )

    var socketActivity = global.onlineSockets.get(userid.toString());

    if (socketActivity) {
        var unreadCount = await Chat.countDocuments({ receiverid: userid, read: false })
        for (const socket of socketActivity) {
            if (socket) {
                socket.emit("unreadMessagesCount", {
                count: unreadCount
                });
            }
        }
    }
  
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
var chats = await Chat.countDocuments({
    receiverid: userid,
    read: false
});

res.status(200).json({
    count: chats
})
}catch(err){
res.status(400).json({
    message: err.message
})
}
}
module.exports = { getChatHistory, getThreads, getThreads2, markAsRead,getUnreadCount }