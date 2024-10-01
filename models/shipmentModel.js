const mongoose = require('mongoose')

const labelSchema = new mongoose.Schema({
    number: {
      type: String,
      default: null
    },
    issueDate: {
      type: Date,
      default: null
    },
    front: {
      type: String,
      default: null
    },
    back: {
      type: String, 
      default: null
    },
    approved: {
      type: Boolean,
      default: null
    }
  }) 

const shipmentSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, required: true },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    kilograms: {
        type: String,
        enum: ["", "1-5", "5-10", "10-15", "15-20"],
        required: true
    },
    deliverySpeed: {
        type: String,
        enum: ["", "standard", "express", "same-day"],
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0.0,
        required: true
    },
    scheduled: {
      type: Boolean,
      default: false
    },
    scheduleType: {
      type: String,
      default: "",
      enum: ["", "date", "hours" ]
    },
    scheduleDate: {
      type: Date,
      default: ""
    },
    scheduleHours: {
      type: String,
      default: ""
    },
    orderid: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "assigning", "intransit", "delivered"]
    }
})

module.exports = mongoose.model('Shipment', shipmentSchema)