const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, required: true },
    history: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    balance:{type:Number, default:0},
    pending:{type:Number, default:0}
})

module.exports = mongoose.model('Wallet', walletSchema)