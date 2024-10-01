const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    senderid: { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverid: { type: mongoose.Schema.Types.ObjectId, required: true },
    message:{type:String,default:""},
    media:{type:String,default:""},
    likedBy: [
        {type: mongoose.Schema.Types.ObjectId}
    ],
    replyof: [
        {type: mongoose.Schema.Types.ObjectId}
    ],
    read: {
        type: Boolean,
        default: false
    },
    delivered: {
        type: Boolean,
        default: false
    },
    seen: {
        type: Boolean,
        default: false
    }
},{timestamps:true})

module.exports = mongoose.model("Chat", chatSchema);