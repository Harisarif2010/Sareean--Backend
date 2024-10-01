const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  participantsCount: {
    type: Number,
    required: true
  }
})

const campaignSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true
    },
    campaignType:{
      type: String,
      default: ""
    },
    category:{
      type: String,
      default: ""
    },
    experienceMethod: {
      type: String,
      default: ""
    },
    uploadLocation: {
      type: String,
      default: ""
    },
    pointsMethod: {
      type: String,
      default: ""
    },
    creatorLevel: {
      type: String,
      enum: ['Pro', "Level 1", "Level 2", "Beginner"],
      default: "Beginner"
    },
    media: {
      type:[mediaSchema],
      default: []
    },
    title: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    applicationPeriod: { // Also named as recruit period in documentation
      type: {
        startDate: { type: Date},
        endDate: { type: Date},
      },
      default: {}
    },
    approvePeriod: {
      type: {
        startDate: { type: Date},
        endDate: { type: Date},
      },
      default: {}
    },
    contentRegistrationPeriod: { // Also named as active period in documentation
      type: {
        startDate: { type: Date},
        endDate: { type: Date},
      },
      default: {}
    },
    submissionPeriod: {
      type: {
        startDate: { type: Date},
        endDate: { type: Date},
      },
      default: {}
    },
    completePeriod: {
      type: {
        startDate: { type: Date},
        endDate: { type: Date},
      },
      default: {}
    },
    reviewPeriod: {
      type: {
        startDate: { type: Date},
        endDate: { type: Date},
      },
      default: {}
    },
    endedOn: {
      type: Date
    },
    productOffered: {
      type: String,
      default: ""
    },
    brandName: {
      type: String,
      default: ""
    },
    brandLogo: {
      type: String,
      default: ""
    },
    resultTypes: {
      type: String,
      default: ""
    },
    mission: {
      type: String,
      default: ""
    },
    contentCreationGuide: {
      type: String,
      default: ""
    },
    titleKeywords: {
      type: [String],
      default: []
    },
    bodyKeywords: {
      type: [String],
      default: []
    },
    hashtags: {
      type: [String],
      default: []
    },
    accountTags: {
      type: [String],
      default: []
    },
    emphasize: {
      type: String,
      default: ""
    },
    toDo: {
      type: String,
      default: ""
    },
    notToDo: {
      type: String,
      default: ""
    },
    landingLink: {
      type: String,
      default: ""
    },
    productDescription: {
      text: {
        type: String,
        default: ""
      },
      images: {
        type: [String],
        default: []
      }
    },
    visit: {
      type: String,
      default: ""
    },
    reservationDate: {
      type: String,
      default: ""
    },
    specialInstructions: {
      type: String,
      default: ""
    },
    howPurchase: {
      type: String,
      default: ""
    },
    deliveryAddress: {
      type: String,
      default: ""
    },
    advertisingCost: {
      type: Number,
      default: 0
    },
    campaignStatus: {
      type: String,
      enum: ["incomplete", "create", "prepare", "recruit", "approve", "active", "submission", "complete", "review", "archive", "delete", "cancel"],
      default: "incomplete"
    },
    active: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      default: ""
    },
    views: {
      type: Number,
      default: 0
    },
    location: {
      type: String,
      default: ""
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    recruits: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    rejected: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    recruitRatio: {
      type: Number,
      default: 0
    },
    cancellationReason: {
      type: String,
      default: "Prefer not to say"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
