const express = require('express')
const router = express.Router()

const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


// const {getUserById , getUserProfile,getAllFollowersAndFollowing, followUser, blockUser, searchUsers, getAllFollowers, getAllFollowing, getBlocked, setProfilePic, getProfilePic, deleteProfilePic,changePassword,editProfile,getAllUsers,resetPasswordRequest,verifyPasswordOtp ,newPassword,setVerified,getVideos,getUserReels ,getImages, deleteUser, deleteUserByUsername, generateShareableProfileLink} 
const {
    getProfilePic,
    setProfilePic,
    getUserById,
    deleteUser,
    deleteUserByUsername,
    generateShareableProfileLink,
    searchUsers,
    changePassword,
    getAllUsers,
    setUserInfo,
    getUserProfile,
    editProfile,
    getUserTransactionHistory
} = require("../controllers/userController")

const requireAuth = require("../middleware/requireAuth")
router.use(requireAuth)

router.get("/getUserById/:userid",getUserById)
// router.get("/getUserProfile/:userid",getUserProfile)
router.get("/getAllUsers",getAllUsers)

router.get("/searchUsers", searchUsers)

router.get("/getProfilePic/:userid", getProfilePic)
router.patch("/setProfilePic", upload.single("image"), setProfilePic)
router.patch("/setUserInfo", setUserInfo)
router.patch("/editProfile",  upload.fields([
    { name: 'licenseFront', maxCount: 1 },  // handle multiple product images, max 10 files
    { name: 'licenseBack', maxCount: 1 }  // handle a single brand logo
]), editProfile)
router.patch("/changePassword",changePassword)
router.delete("/deleteUser", deleteUser);
router.get("/deleteUser", deleteUserByUsername);
router.get("/getUserProfile/:userid", getUserProfile);
router.get("/generateShareableProfileLink/:userId", generateShareableProfileLink);  
router.get("/getUserTransactionHistory/:userid", getUserTransactionHistory)


module.exports = router

