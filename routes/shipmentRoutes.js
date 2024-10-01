const express = require('express')
const router = express.Router()

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const {
    addShipment,
    getAllShipments,
    searchShipments,
    deleteShipment,
    getShipmentById,
    scheduleShipment,
    cancelShipment,
    getUserOrders,
    payForShipment,
    getUserRequests,
    getUserShipments,
    getShipmentPrice,
    generateDriverRequest,
    confirmDriverRequest,
    scheduleDriverRequest
} = require("../controllers/shipmentController")

const requireAuth = require("../middleware/requireAuth")
router.use(requireAuth)

router.get("/getShipmentById/:orderid",getShipmentById)
router.get("/getAllShipments",getAllShipments)
router.get("/searchShipments", searchShipments)
router.delete("/deleteShipment", deleteShipment);
router.post("/addShipment", addShipment)
router.patch("/scheduleShipment", scheduleShipment)
router.patch("/cancelShipment", cancelShipment);
router.get("/getUserOrders/:userid", getUserOrders);
router.patch("/payForShipment", payForShipment);
router.get("/getUserRequests/:userid", getUserRequests);
router.get("/getUserShipments/:userid", getUserShipments);
router.get("/getShipmentPrice/:orderid", getShipmentPrice);
router.post("/generateDriverRequest", generateDriverRequest);
router.post("/confirmDriverRequest", confirmDriverRequest);
router.post("/scheduleDriverRequest", scheduleDriverRequest)

module.exports = router

