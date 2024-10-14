const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    userid: { type: mongoose.Schema.Types.ObjectId, required: true },
    pickupid: {
      type: String,
      required: true
    },
    pickupLocation: {
      type: String
    },
    shipments: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    },
    driverid: {
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      type: String,
      default: "unassigned",
      enum: ["unassigned", "intransit", "reassigned", "scheduled"]
    },
    scheduleTime: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pickup", pickupSchema);
