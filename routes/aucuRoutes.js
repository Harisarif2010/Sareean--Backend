const express = require('express')
const router = express.Router()

const {getCompanyInfo, setCompanyInfo, getTerms, setTerm, getPrivacies, setPrivacy, getFaqs, setFaqs, setNotices,  getNotices} = require("../controllers/aucuController")


router.get("/getCompanyInfo",getCompanyInfo)
router.patch("/setCompanyInfo", setCompanyInfo)

router.get("/getTerms",getTerms)
router.patch("/setTerm", setTerm)

router.get("/getPrivacies",getPrivacies)
router.patch("/setPrivacy", setPrivacy)

router.get("/getFaqs",getFaqs)
router.patch("/setFaqs", setFaqs)

router.get("/getNotices", getNotices)
router.patch("/setNotices",setNotices)

module.exports = router