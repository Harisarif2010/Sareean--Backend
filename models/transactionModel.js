const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
    },
    orderid: mongoose.Schema.Types.ObjectId,
    amount: Number,
    status: {
        type: String,
        default: "pending",
        enum: ["paid", "pending"]
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);
