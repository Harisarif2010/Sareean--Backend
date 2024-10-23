const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema({
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
  },
  nationality: {
    type: String,
    default: ""
  }
})

const getDefaultlicense = () => ({
  number: 0,
  issueDate: "",
  front: "",
  back: "",
  approved: false
});

const vehicleSchema = new mongoose.Schema({
  country: {
    type: String,
    default: null
  },
  number: {
    type: String,
    default: null
  },
  approved: {
    type: Boolean,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: null
  }
})

const getDefaultvehicle = () => ({
  country: "",
  number: "",
  approved: false,
  name: "truck",
  category: "light"
});

const bankSchema = new mongoose.Schema({
  number: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: null
  },
  bank: {
    type: String,
    default: null
  },
  approved: {
    type: Boolean,
    default: null
  }
})

const getDefaultbank = () => ({
  number: "",
  name: "",
  bank: "",
  approved: false
});

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    default: "" 
  },
  email: { 
    type: String, 
    default: "" 
  },
  password: { 
    type: String, 
    default: "" 
  },
  phone: { 
    type: String, 
    default: "" 
  },
  walletid: {
    type: mongoose.Schema.Types.ObjectId
  },
  accountType: {
    type: String,
    enum: ["personal", "business"]
  },
  profilePic: {
    type: String, 
    default: ""
  },
  address: { 
    type: String, 
    default: "" 
  },
  primaryAddress: { 
    type: String, 
    default: "" 
  },
  neighborhood:{ 
    type: String, 
    default: ""
  },
  city: { 
    type: String, 
    default: ""
  },
  country: { 
    type: String, 
    default: "" 
  },
  zipcode: { 
    type: String, 
    default: "" 
  },
  plusCodes: {
    type: [String],
    default: []
  },
  locations: {
    type: [String],
    default: []
  },
  fcmtoken: [{ type: String, default: [] }],
  userType: {
    type: String,
    enum: ["customer", "driver", "admin"]
  },
  businessName: {
    type: String,
    default: ""
  },
  areaCode: {
    type: String, 
    default: ""
  },
  license: licenseSchema,
  vehicle: vehicleSchema,
  bank: bankSchema,
  orders: {
    type: Number,
    default: 0
  },
  cancelled: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0.0
  },
  accountStatus: {
    type: String,
    default: "underReview",
    enum: ["approved", "disapproved", "underReview", "block"]
  },
  receiverName: {
    type: String,
    default: ""
  },
  shipments: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  pickups: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  driverTasks: {
    type: [mongoose.Schema.Types.ObjectId]
  }
});

module.exports = mongoose.model("User", userSchema);
