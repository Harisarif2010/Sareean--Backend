const express = require('express')
const router = express.Router()

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const {
    createCampaign,
    updateCampaignUi,
    getCampaignUi,
    getCampaigns,
    //routes there just for test
    categoryTestPopulation,
    restoreTestCampaign,
    payForCampaign,
    getCampaignsForApplication,
    getCampaignStatus,
    joinCampaign,
    processJoinRequest,
    deleteCampaign,
    cancelCampaign,
    getCampaignById,
    duplicateCampaignById,
    getUserCampaigns,
    getmediaLevelLimits
} = require("../controllers/campaignController")

const requireAuth = require("../middleware/requireAuth")

router.get("/getCampaignUi", getCampaignUi)

//test routes
router.get("/categoryTestPopulation", categoryTestPopulation)
router.get("/restoreTestCampaign", restoreTestCampaign);
//testroutes dn

router.use(requireAuth)



router.post("/createCampaign", upload.fields([
    { name: 'productImages', maxCount: 20 },  // handle multiple product images, max 10 files
    { name: 'brandLogo', maxCount: 1 }  // handle a single brand logo
]), createCampaign)
router.post("/updateCampaignUi", updateCampaignUi);
router.get("/getCampaigns", getCampaigns);
router.get("/getCampaignStatus/:campaignid", getCampaignStatus)
router.get("/getCampaignsForApplication", getCampaignsForApplication);
router.patch("/payForCampaign", payForCampaign);
router.patch("/joinCampaign", joinCampaign);
router.patch("/processJoinRequest", processJoinRequest);

router.delete("/deleteCampaign", deleteCampaign)
router.get("/getCampaignById/:campaignid", getCampaignById);
router.patch("/cancelCampaign", cancelCampaign) //remaingin
router.post("/duplicateCampaignById", duplicateCampaignById);

router.get("/getUserCampaigns/:userid", getUserCampaigns)
router.get("/getmediaLevelLimits", getmediaLevelLimits)




module.exports = router

