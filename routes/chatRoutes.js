const express = require('express')
const router = express.Router()

const requireAuth = require("../middleware/requireAuth")
router.use(requireAuth)

const {getChatHistory,getThreads, markAsRead, getUnreadCount} = require("../controllers/chatController")

router.get("/getChatHistory",getChatHistory)
router.get("/getThreads/:userid",getThreads)
router.patch("/markAsRead", markAsRead);
router.get("/getUnreadCount/:userid", getUnreadCount);



module.exports = router