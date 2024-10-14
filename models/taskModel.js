const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    driverid: { type: mongoose.Schema.Types.ObjectId, required: true },
    pickupid: { type: mongoose.Schema.Types.ObjectId, required: true }
})

module.exports = mongoose.model('Task', taskSchema)