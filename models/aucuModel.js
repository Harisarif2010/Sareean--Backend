// aucu Admin User Connection Ui. (Model)
const mongoose = require("mongoose");

const aucuSchema = new mongoose.Schema({
  campaignUi: {
    campaignType: {
      title: {
        type: String,
        default: "Campaign Type"
      },
      values: {
        type: [String],
        default: [
          "General",
          "Quick",
          "ImFact"
        ]
      },
      valueStyle: {
        type: String,
        default: "tile"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },    
    category: {
      title: {
        type: String,
        default: "Campaign Category"
      },
      values: {
          type: [String],
          default: [
            "Beauty",
            "Fashion",
            "Childcare",
            "Digital",
            "Food/Restraunt/Cafe",
            "Books/Education/Performance",
            "Hobbies/Exercise/Space",
            "Life/Kitchen",
            "Travel/Hotel/Activity",
            "Service",                       
          ]
        },
      valueStyle: {
        type: String,
        default: "dropdown"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    experienceMethod: {
      title: {
        type: String,
        default: "Experience Method"
      },
      values: {
          type: [String],
          default: [
            "Product Experience",
            "Content Experience",
            "Inperson Experience"                 
          ]
        },
      valueStyle: {
        type: String,
        default: "tile"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    uploadLocation: {
      title: {
        type: String,
        default: "Where to upload content"
      },
      values: {
          type: [String],
          default: [
                "Creator Account",
                "Third party site",
                "Just Deliver"                  
          ]
        },
      valueStyle: {
        type: String,
        default: "tile"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    pointsMethod: {
      title: {
        type: String,
        default: "Points provision method"
      },
      values: {
          type: [String],
          default: [
            "Points",
            "Payback"                    
          ]
        },
      valueStyle: {
        type: String,
        default: "tile"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    media: {
      title: {
        type: String,
        default: "Media"
      },
      values: {
          type: [String],
          default: [
            "Youtube",
            "Youtube Shorts",
            "Instagram",
            "Instagram Reels",
            "Naver",
            "Naver Blog",
            "Tiktok",
            "Tiktok Shopping",                    
            "Twitter",
            "Threads"                    
          ]
        },
      valueStyle: {
        type: String,
        default: "doubleinput"
      },
      single: {
        type: Boolean,
        default: false
      },
      reqType: {
        type: String,
        default: "objectarray"
      }
    },
    title: {
      title: {
        type: String,
        default: "Title"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    description: {
      title: {
        type: String,
        default: "Description"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    applicationPeriod: {
      title: {
        type: String,
        default: "Application period"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "doubleinput"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "object"
      }
    },
    contentRegistrationPeriod: {
      title: {
        type: String,
        default: "Content registration period"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "doubleinput"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "object"
      }
    },
    productOffered: {
      title: {
        type: String,
        default: "Products offered"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    brandName: {
      title: {
        type: String,
        default: "Brand Name"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    brandLogo: {
      title: {
        type: String,
        default: "Brand Logo"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "imageinput"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "image"
      }
    },
    resultTypes: {
      title: {
        type: String,
        default: "Types of submitted results"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    mission: {
      title: {
        type: String,
        default: "Campaign Mission"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    contentCreationGuide: {
      title: {
        type: String,
        default: "Contend creation guide"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    titleKeywords: {
      title: {
        type: String,
        default: "Title keywords"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "tags"
      },
      single: {
        type: Boolean,
        default: false
      },
      reqType: {
        type: String,
        default: "stringarray"
      }
    },
    bodyKeywords: {
      title: {
        type: String,
        default: "Body keywords"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "tags"
      },
      single: {
        type: Boolean,
        default: false
      },
      reqType: {
        type: String,
        default: "stringarray"
      }
    },
    hashtags: {
      title: {
        type: String,
        default: "Hashtags"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "tags"
      },
      single: {
        type: Boolean,
        default: false
      },
      reqType: {
        type: String,
        default: "stringarray"
      }
    },
    accountTags: {
      title: {
        type: String,
        default: "Account Tags"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "tags"
      },
      single: {
        type: Boolean,
        default: false
      },
      reqType: {
        type: String,
        default: "stringarray"
      }
    },
    emphasize: {
      title: {
        type: String,
        default: "What should be emphasized"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    toDo: {
      title: {
        type: String,
        default: "What to do"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    notToDo: {
      title: {
        type: String,
        default: "What not to do"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    landingLink: {
      title: {
        type: String,
        default: "Landing link"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    productName: {
      title: {
        type: String,
        default: "Product title"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    productImage: {
      title: {
        type: String,
        default: "Product Image"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "imageinput"
      },
      single: {
        type: Boolean,
        default: false
      },
      reqType: {
        type: String,
        default: "images"
      }
    },
    visitAndReservation: {
      title: {
        type: String,
        default: "Visit and reservation information"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    howPurchase: {
      title: {
        type: String,
        default: "How to purchase"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    deliveryAddress: {
      title: {
        type: String,
        default: "Delivery Address"
      },
      values: [
        {
          type: String,
          default: []
        }
      ],
      valueStyle: {
        type: String,
        default: "input"
      },
      single: {
        type: Boolean,
        default: true
      },
      reqType: {
        type: String,
        default: "string"
      }
    },
    mediaAssets: {
      type: [String],
      default: [            
        "https://211.45.162.49.nip.io/968babb9cf313b94faef2a9b32e41938ebf5b8f30a05c56445f7a217134d9d0f.png",
        "https://211.45.162.49.nip.io/30eed12050821becb8096a6f1b3df7857e3999dedd3206c8c38850f82f00027a.png",
        "https://211.45.162.49.nip.io/4d8440a094e7c0772e650f32b636ee8d03b237833b24f06a373fc1130a0e9959.png",
        "https://211.45.162.49.nip.io/0e1dc0f1ffce0e17973be99d4048e444fe25ad248027e76ff4f1e4eaf699e49e.png",
        "https://211.45.162.49.nip.io/72a0feb9158651dafd5522f3f4e5e69716f2b4c157ae7ca428bd621a59484a7e.png",
        "https://211.45.162.49.nip.io/ace45d7a0e80d7a842ce6481f8fb69ed2471d7e8edd6675be386d026e892fd84.png",
        "https://211.45.162.49.nip.io/718fd9d5aaf2c88adbcc543ef93de97699367eefc2ac831b3fedb8acaad3b42b.png",
        "https://211.45.162.49.nip.io/92559251f5815488f67bf0e305f99aba579897fd5fe11ed778e1ca210477a1c7.png",
        "https://211.45.162.49.nip.io/4441683b871c1a86d873d5e69f105d5e22e0413574162eadb38b3045f15ef562.png",
        "https://211.45.162.49.nip.io/56097e52a48f71f3beb75c26d07527db0099fe2a3c935fccee0f8c0d2e4ed810.png",
      ]
    }
  },
  campaignOptions: {
    approveStateDuration: {  // for general campaign type in which auto set of approve state of campaign duration is 3 days
      type: Number,
      default: 3
    },
    activeStateDuration: { // for quick camapign type in which auto set of active state of campaign duration is 1 day
      type: Number,
      default: 1
    },
    submissionStateDuration:{ // quick and impact ai campaign type in which auto set of submission state of campaign duration is 3 days
      type: Number,
      default: 3
    },
    completeStateDuration: {  // complete state days for campaign auto set is 7 days
      type: Number,
      default: 7
    },
    reviewStateDuration: {  // review state days for campaign auto set is 3 days
      type: Number,
      default: 3
    }
  },
  mediaLevelLimits: {
    entry:{
      type: [{
        name: {
          type: String
        },
        minVal: {
          type: Number
        }
      }],
      default: [
        {
          name: "Youtube",
          minVal: 0
        },
        {
          name: "Youtube Shorts",
          minVal: 0
        },
        {
          name: "Instagram",
          minVal: 0
        },
        {
          name: "Instagram Reels",
          minVal: 0
        },
        {
          name: "Naver",
          minVal: 0
        },
        {
          name: "Naver Blog",
          minVal: 0
        },
        {
          name: "Tiktok",
          minVal: 0
        },
        {
          name: "Tiktok Shopping",
          minVal: 0
        },
        {
          name: "Twitter",
          minVal: 0
        },
        {
          name: "Thread",
          minVal: 0
        }
      ]
    },
    level0:{
      type: [{
        name: {
          type: String
        },
        minVal: {
          type: Number
        }
      }],
      default: [
        {
          name: "Youtube",
          minVal: 5000
        },
        {
          name: "Youtube Shorts",
          minVal: 5000
        },
        {
          name: "Instagram",
          minVal: 5000
        },
        {
          name: "Instagram Reels",
          minVal: 5000
        },
        {
          name: "Naver",
          minVal: 5000
        },
        {
          name: "Naver Blog",
          minVal: 5000
        },
        {
          name: "Tiktok",
          minVal: 5000
        },
        {
          name: "Tiktok Shopping",
          minVal: 5000
        },
        {
          name: "Twitter",
          minVal: 5000
        },
        {
          name: "Thread",
          minVal: 5000
        }
      ]
    },
    level1:{
      type: [{
        name: {
          type: String
        },
        minVal: {
          type: Number
        }
      }],
      default: [
        {
          name: "Youtube",
          minVal: 10000
        },
        {
          name: "Youtube Shorts",
          minVal: 10000
        },
        {
          name: "Instagram",
          minVal: 10000
        },
        {
          name: "Instagram Reels",
          minVal: 10000
        },
        {
          name: "Naver",
          minVal: 10000
        },
        {
          name: "Naver Blog",
          minVal: 10000
        },
        {
          name: "Tiktok",
          minVal: 10000
        },
        {
          name: "Tiktok Shopping",
          minVal: 10000
        },
        {
          name: "Twitter",
          minVal: 10000
        },
        {
          name: "Thread",
          minVal: 10000
        }
      ]
    },
    level2:{
      type: [{
        name: {
          type: String
        },
        minVal: {
          type: Number
        }
      }],
      default: [
        {
          name: "Youtube",
          minVal: 20000
        },
        {
          name: "Youtube Shorts",
          minVal: 20000
        },
        {
          name: "Instagram",
          minVal: 20000
        },
        {
          name: "Instagram Reels",
          minVal: 20000
        },
        {
          name: "Naver",
          minVal: 20000
        },
        {
          name: "Naver Blog",
          minVal: 20000
        },
        {
          name: "Tiktok",
          minVal: 20000
        },
        {
          name: "Tiktok Shopping",
          minVal: 20000
        },
        {
          name: "Twitter",
          minVal: 20000
        },
        {
          name: "Thread",
          minVal: 20000
        }
      ]
    },
    pro:{
      type: [{
        name: {
          type: String
        },
        minVal: {
          type: Number
        }
      }],
      default: [
        {
          name: "Youtube",
          minVal: 50000
        },
        {
          name: "Youtube Shorts",
          minVal: 50000
        },
        {
          name: "Instagram",
          minVal: 50000
        },
        {
          name: "Instagram Reels",
          minVal: 50000
        },
        {
          name: "Naver",
          minVal: 50000
        },
        {
          name: "Naver Blog",
          minVal: 50000
        },
        {
          name: "Tiktok",
          minVal: 50000
        },
        {
          name: "Tiktok Shopping",
          minVal: 50000
        },
        {
          name: "Twitter",
          minVal: 50000
        },
        {
          name: "Thread",
          minVal: 50000
        }
      ]
    }
  },
  notice:{
    type: [{
      noticeType: String,
      text: String,
      answer: String,
      date: Date
    }],
    default: []
  },
  faqs:{
    type: [{
      faqType: String,
      text: String,
      answer: String,
      date: Date
    }],
    default: []
  },
  privacy:{
    type: [
      {
        date: Date,
        text: String
      }
    ]
  },
  term:{
    type: [
      {
        date: Date,
        text: String
      }
    ]
  },
  companyInfo:{
    type: String
  }
})

module.exports = mongoose.model("Aucu", aucuSchema);