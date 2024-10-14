const express = require('express')
const router = express.Router()

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const {
    getDriverTasks,
    acceptPickup
} = require("../controllers/driverController")

const requireAuth = require("../middleware/requireAuth")
router.use(requireAuth)

router.get("/getDriverTasks/:driverid",getDriverTasks)
router.patch("/acceptPickup", acceptPickup)

module.exports = router

