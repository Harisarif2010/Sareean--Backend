const User = require("../models/userModel")
const Campaign = require("../models/campaignModel")
const Aucu = require("../models/aucuModel")
const {createActivity} = require("../controllers/activityController")
const Transaction = require("../models/transactionModel")
const {is, tryCatch, error, validateUser, truncateString} = require("../helpers/otherHelpers")
const {sendNotification} = require("./notificationController")

const moment = require("moment");
const { parse } = require('date-fns');


const createCampaign = async(req, res)=>{
    try{
        var {
            userid,
            campaignType,
            category,
            experienceMethod,
            uploadLocation,
            pointsMethod,
            media,
            title,
            description,
            applicationPeriod,
            contentRegistrationPeriod,
            productOffered,
            brandName,
            brandLogo,
            resultTypes,
            mission,
            contentCreationGuide,
            titleKeywords,
            bodyKeywords,
            hashtags,
            accountTags,
            emphasize,
            toDo,
            notToDo,
            landingLink,
            productName,
            visit,
            reservationDate,
            specialInstructions,
            howPurchase,
            deliveryAddress,
            creatorLevel,
            campaignid
        } = req.body
        const user = await validateUser(userid, "customer")
        var aucu = await getAucu();
        var autosets = await getCampaignOptions();
        var campaignUi = aucu.campaignUi;
        var updatedData = {};
        function newData(data){
            var keys = Object.keys(data);
            keys.forEach(key => {
                updatedData[key] = data[key]
            })
        }
        var campaign = null;
        if(campaignid){
            campaign = await Campaign.findById(campaignid);
        }
        

        newData({userid})
        function ifStringToDate(data){
            if(typeof data === "string"){
                var parts = data.split('-');
                var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
                console.log("date: ", date);
                return date;
            }else{
                return data;
            }
        }

        var advertisingCost = 0;
        if(campaignType){
            if(campaignUi.campaignType.values.includes(campaignType)){
                newData({campaignType})
            }else{
                error(res, "Please enter valid campaign type", true)
                return
            }
        }
        if(category){
            if(campaignUi.category.values.includes(category)){
                newData({category})
            }else{
                error(res, "Please enter valid category", true)
                return
            }
        }
        // may be there coule be error()
        if(experienceMethod){
            if(!campaignUi.experienceMethod.values.includes(experienceMethod)){
                error(res, "Please enter valid experience method", true)
                return

            }
            
            newData({experienceMethod})

            if(experienceMethod == "inperson"){
                var checkValue = visit;
                if(campaignid){
                    checkValue = campaign.visit
                }
                if(!checkValue || checkValue.trim() == ""){
                    error(res, "For In-person experience method you should provide visit and reservation information as well", true)
                    return
                }
            }
        }

        if(visit){
            newData({visit})
        }
        if(reservationDate){
            newData({reservationDate})
        }
        if(specialInstructions){
            newData({specialInstructions})
        }

        if(uploadLocation){
            if(!campaignUi.uploadLocation.values.includes(uploadLocation)){
                error(res, "Please enter valid location to upload", true)
                return
            }

            newData({uploadLocation})
        }

        if(pointsMethod){
            if(!campaignUi.pointsMethod.values.includes(pointsMethod)){
                error(res, "Please enter valid method for points", true)
                return

            }
            
            newData({pointsMethod})

            if(pointsMethod == "payback"){
                var checkValue = howPurchase;
                if(campaignid){
                    checkValue = campaign.howPurchase
                }
                if(!checkValue || checkValue.trim() == ""){
                    error(res, "For payback method of points provision please provide how to purchase as well", true)
                    return
                }
            }
        }

        if(howPurchase){
            newData({howPurchase})
        }
        if(media){
            var allowedMediaTypes = campaignUi.media.values;
              var format = true;
              media = typeof media === "string" ? JSON.parse(media) : media
            if(media.constructor == Array){
                await Promise.all(
                    media.map(m => {
                        if(m.type && allowedMediaTypes.includes(m.type)){
                            if(m.amount && m.participantsCount){
                                advertisingCost += m.amount*m.participantsCount;
                            }else{
                                format = false;
                                error(res, "amount or participantCount is missing")
                            }
                        }else{
                            error(res, "Please enter valid media type")
                        }
                    })
                )
            }else{
                error(res, 'Please provide array of media')
            }

            if(format){
                newData({media})
            }
        }
        if(title){
            newData({title})
        }
        if(description){
            newData({description})
        }
        if(creatorLevel){
            newData({creatorLevel})
        }
        var approvePeriod;
        if(campaignType && getSlug(campaignType).includes("general")){
            if(applicationPeriod){
                applicationPeriod = typeof applicationPeriod === "string" ? JSON.parse(applicationPeriod) : applicationPeriod
                if(applicationPeriod.startDate && applicationPeriod.endDate){
                    applicationPeriod.startDate = ifStringToDate(applicationPeriod.startDate);
                    applicationPeriod.endDate = ifStringToDate(applicationPeriod.endDate);
                    newData({applicationPeriod})

                    approvePeriod = calcDate(applicationPeriod.endDate, autosets.approveStateDuration - 1, 1);
                    newData({approvePeriod})

                }else{
                    error(res, "Please provide start date as well as end date for application period")
                }
            }
        }
        if(campaignType && !getSlug(campaignType).includes("quick")){
            if(contentRegistrationPeriod){
                contentRegistrationPeriod = typeof contentRegistrationPeriod === "string" ? JSON.parse(contentRegistrationPeriod) : contentRegistrationPeriod
                if(contentRegistrationPeriod.startDate && contentRegistrationPeriod.endDate){
                    contentRegistrationPeriod.startDate = ifStringToDate(contentRegistrationPeriod.startDate);
                    contentRegistrationPeriod.endDate = ifStringToDate(contentRegistrationPeriod.endDate);



                    console.log("contentRegistrationPeriod: ", contentRegistrationPeriod.startDate)
                    if(getSlug(campaignType).includes("general")){
                        console.log("approvePeriod: ", approvePeriod.endDate)
                        if(getToday(contentRegistrationPeriod.startDate) <=   getToday(approvePeriod.endDate)){
                            error(res, "Please provide active period date atleast 3 days after the end date of approve period in campaign!"); //Because active period is autoset and would be change induration from the admin panel
                        }
                    }

                    var submissionPeriod = calcDate(contentRegistrationPeriod.endDate, autosets.submissionStateDuration - 1, 1);
                    newData({submissionPeriod})

                    var completePeriod = calcDate(submissionPeriod.endDate, autosets.completeStateDuration - 1, 1);
                    newData({completePeriod})

                    var reviewPeriod = calcDate(completePeriod.endDate, autosets.reviewStateDuration - 1, 1);
                    newData({reviewPeriod})

                    newData({contentRegistrationPeriod})
                }else{
                    error(res, "Please provide start date as well as end date for content registration period")
                }
            }
        }
        if(productOffered){
            newData({productOffered})
        }
        if(brandName){
            newData({brandName})
        }
        if(brandLogo){
            var brandLogoNew = ""
            if(req.files['brandLogo']){
                var contentName = await is.upload(req.files['brandLogo'][0]);
                brandLogoNew = contentName;
            }
            newData({brandLogo: brandLogoNew})
        }
        if(resultTypes){
            newData({resultTypes})
        }
        if(mission){
            newData({mission})
        }
        if(contentCreationGuide){
            newData({contentCreationGuide})
        }
        if(titleKeywords){
            titleKeywords = typeof titleKeywords === "string" ? JSON.parse(titleKeywords) : titleKeywords
            if(titleKeywords.constructor == Array){
                newData({titleKeywords})
            }else{
                error(res, 'Please provide array of title keywords')
            }
        }
        if(bodyKeywords){
            bodyKeywords = typeof bodyKeywords === "string" ? JSON.parse(bodyKeywords) : bodyKeywords
            if(bodyKeywords.constructor == Array){
                newData({bodyKeywords})
            }else{
                error(res, 'Please provide array of body keywords')
            }
        }
        if(hashtags){
            hashtags = typeof hashtags === "string" ? JSON.parse(hashtags) : hashtags
            if(hashtags.constructor == Array){
                newData({hashtags})
            }else{
                error(res, 'Please provide array of hashtags')
            }
        }
        if(accountTags){
            accountTags = typeof accountTags === "string" ? JSON.parse(accountTags) : accountTags
            if(accountTags.constructor == Array){
                newData({accountTags})
            }else{
                error(res, 'Please provide array of account tags')
            }
        }
        if(emphasize){
            newData({emphasize})
        }
        if(toDo){
            newData({toDo})
        }
        if(notToDo){
            newData({notToDo})
        }
        if(landingLink){
            newData({landingLink})
        }
        // if(!req.files['productImages']){
        //     error(res, "Please select atleast")
        // }
        if(productName){
            var uploadedFiles = [];
            if(req.files['productImages']){
                await Promise.all(
                    req.files['productImages'].map(async content => {
                        var contentName = await is.upload(content);
                        uploadedFiles.push(contentName);
                    })
                )
            }
            newData({
                productDescription : {
                    text: productName,
                    images: uploadedFiles
                }
            })
        }
        if(deliveryAddress){
            newData({deliveryAddress})
        }
        newData({advertisingCost})

        if(campaignid){
            campaign = await Campaign.findById(campaignid);
            if(!campaign){
                error(res, "please provide valid campaign id")
            }
            campaign = await Campaign.findOneAndUpdate({_id: campaignid}, updatedData,
                { new: true, useFindAndModify: false }
            )
        }else{
            campaign = await Campaign.create(updatedData);
            await user.updateOne({
                $push: { campaignsCreated: campaign._id }
            })
        }

        //check whether completed campaign in created
        var checkComplete = [
            "campaignType",
            "category",
            "experienceMethod",
            "uploadLocation",
            "pointsMethod",
            "media",
            "title",
            "description",
            "productOffered",
            "brandName",
            "brandLogo",
            "resultTypes",
            "mission",
            "contentCreationGuide",
            "titleKeywords",
            "bodyKeywords",
            "hashtags",
            "accountTags",
            "emphasize",
            "toDo",
            "notToDo",
            "productDescription",
            "visit",
            "reservationDate",
            "specialInstructions",
            "howPurchase",
            "deliveryAddress",
            "advertisingCost",
            "applicationPeriod",
            "contentRegistrationPeriod",
            "creatorLevel"
        ]
        
        var objectCheck = [
            "applicationPeriod",
            "contentRegistrationPeriod"
        ]

        var defaultValues = new Campaign({
            userid: "testuserid"
        });

        var complete = true;
        checkComplete.forEach(check => {
            var defaultCheck  = defaultValues[check];
            if(check != "productDescription" && !objectCheck.includes(check) && defaultCheck){
                if(defaultCheck.constructor == Array ? campaign[check].length == defaultCheck.length : campaign[check] == defaultCheck){
                    complete = false;
                    return;
                }
            }else{
                if(campaign.productDescription.text.trim() == "" || campaign.productDescription.images.length == 0){
                    complete = false;
                    return;
                }
            }
        })

        if(complete){
            var newSta = "create";
            if(campaign){
                var transaction = await Transaction.findOne({modelType: "campaign", modelId: campaign._id })
                if(transaction){
                    newSta = "prepare"
                }
                if(contentRegistrationPeriod){
                    if(contentRegistrationPeriod.startDate <= campaign.applicationPeriod.endDate){
                        newSta = "archive";
                    }
                }
            }
                await campaign.updateOne({
                campaignStatus: newSta
            })
        }
        //check ends    

        res.status(200).json({
            success: true,
            advertisingCost: campaign.advertisingCost,
            campaignid: campaign._id
        })

    }catch(err){
        console.log("ERROR: ", err.message);
        error(res, err.message)
    }
}

const payForCampaign = async(req, res) => {
    tryCatch(async ()=>{
        const {amount, campaignid, userid} = req.body;
        const user = await validateUser(userid, "customer")

        const campaign = await Campaign.findById(campaignid);
        if(!campaign){
            error(res, "Invalid campaign id")
        }

        if(!user.campaignsCreated.includes(campaignid)){
            error(res, "This is not your campaign to pay for")
        }


        if(campaign.campaignStatus != "incomplete"){
            // do the payment system working here

            await Transaction.create({ 
                userid,
                amount,
                modelType: "campaign",
                modelId: campaignid
            })

            

            var archive = false;
            if(campaign && campaign.campaignType && !getSlug(campaign.campaignType).includes("general")){
                var autosets = await getCampaignOptions()
                var today = getToday();
                var startTomorrow = 1;
                var applicationPeriod = calcDate(today, 0, startTomorrow);
                console.log("application period: ", applicationPeriod)
                
                var updatedData = {};
                updatedData["applicationPeriod"] = applicationPeriod
                updatedData["approvePeriod"] = applicationPeriod
                if(getSlug(campaign.campaignType).includes("quick")){
                    var activePeriod = calcDate(applicationPeriod.endDate, autosets.activeStateDuration - 1, 1);
                    updatedData["contentRegistrationPeriod"] = activePeriod
                    console.log("content regitration period: ", activePeriod)
                    updatedData["submissionPeriod"] = activePeriod
                    var completePeriod = calcDate(activePeriod.endDate, autosets.completeStateDuration - 1, 1);
                    updatedData["completePeriod"] = completePeriod
    
                    var reviewPeriod = calcDate(completePeriod.endDate, autosets.reviewStateDuration - 1, 1);
                    updatedData["reviewPeriod"] = reviewPeriod
                }

                if(getSlug(campaign.campaignType).includes("imfact")){
                    if(campaign.contentRegistrationPeriod.startDate <= applicationPeriod.endDate){
                        await user.updateOne({
                            $push: {
                                customerActionRequired: {
                                    for: "campaign",
                                    modelid: campaignid,
                                    action: "Update your campaign content registration period for activating the campaign"
                                }
                            }
                        })
                        archive = true;
                        await campaign.updateOne({campaignStatus: "archive"})
                    }
                }
                await campaign.updateOne(updatedData)

                //check and do state management for all type of campaigns
                
            }
            if(!archive){
                await campaign.updateOne({campaignStatus: "prepare"});
            }


            res.status(200).json({
                success: true,
                message: "Transaction successful!"
            })
        }else{
            error(res, "Please complete the campaign creation first")
        }

        if(campaign.campaignStatus == "prepare"){
            error(res, "Already paid for this campaign");
        }
    } ,res)
}

const updateCampaignUi = async(req, res)=>{
    try{
        const {
            campaignType,
            category,
            experienceMethod,
            uploadLocation,
            pointsMethod,
            media,
            title,
            description,
            applicationPeriod,
            contentRegistrationPeriod,
            productOffered,
            brandName,
            brandLogo,
            resultTypes,
            mission,
            contentCreationGuide,
            titleKeywords,
            bodyKeywords,
            hashtags,
            accountTags,
            emphasize,
            toDo,
            notToDo,
            landingLink,
            productName,
            productImage,
            visit,
            reservationDate,
            specialInstructions,
            howPurchase,
            deliveryAddress
        } = req.body

        var aucu = await getAucu();

        
        var updatedData = {$set: {}};
        async function updateProperty(property, title = null, values = null, valueStyle = null ){
            if(title){
                updatedData.$set[`campaignUi.${property}.title`] = title
            }
            
            if(valueStyle){
                updatedData.$set[`campaignUi.${property}.valueStyle`] = valueStyle
            }

            if(values){
                updatedData.$set[`campaignUi.${property}.values`] = values
            }

        }
        
        async function validateUpdateDispatch(dispatch, name){
            if(!dispatch.title && !dispatch.values && !dispatch.valueStyle){
                error(res, `Please provide valid format for ${name}`);
            }
            if(!dispatch.title){
                dispatch["title"] = null;
            }
            if(!dispatch.values){
                dispatch["values"] = null
            }
            if(!dispatch.valueStyle){
                dispatch["valueStyle"] = null
            }

            await updateProperty(name, dispatch.title, dispatch.values, dispatch.valueStyle)
        }

        const requiredCampaignProperties = [
            "campaignType", "category", "experienceMethod", "uploadLocation", "pointsMethod",
            "media", "title", "description", "applicationPeriod", "contentRegistrationPeriod",
            "productOffered", "brandName", "brandLogo", "resultTypes", "mission",
            "contentCreationGuide", "titleKeywords", "bodyKeywords", "hashtags", "accountTags",
            "emphasize", "toDo", "notToDo", "landingLink", "productName", "productImage",
            "visit", "reservationDate", "specialInstructions", "howPurchase", "deliveryAddress"
        ];

        const reqBodyKeys = Object.keys(req.body);

        reqBodyKeys.forEach(property => {
            if(requiredCampaignProperties.includes(property)){
                validateUpdateDispatch(req.body[property], property);
            }
        })
        
        if(updatedData != {}){
            await aucu.updateOne(updatedData);
        }

        res.status(200).send({
            success: true,
            message: "Updated the changes in Campaign Ui"
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const getCampaignUi = async(req, res)=>{
    var aucu = await getAucu();
    // var campaignUiArray = [];
    // aucu.campaignUi.map(cam =>{
    //     console.log(cam)
    // })
    // for (const key in aucu.campaignUi) {
    //     console.log("Key:", key);
    //     console.log("push:", aucu.campaignUi[key]);
    //     campaignUiArray.push(aucu.campaignUi[key]);
    // }

    // var model = new Aucu()
//   const schemaKeys = Object.keys(model.campaignUi);

//   for (const key in aucu.campaignUi) {
//     if (schemaKeys.includes(key)) {
//       campaignUiArray.push({ key: key,value: aucu.campaignUi[key] });
//     }
//   }

    res.status(200).json(
        // campaignUiArray
        aucu.campaignUi
    )
}

const getmediaLevelLimits = async(req, res)=>{
    var aucu = await getAucu();
    var campaignMediaLevels= aucu.mediaLevelLimits;
    res.status(200).json(
        campaignMediaLevels
    )
}

const getCampaigns = async(req, res)=>{
    //http://localhost:4000/campaign/getCampaigns?category=travelhotelactivity&point=points&experience=inpersonexperience&upload=justdeliver&sort=popularity|deadline|possibility|latest
    var {category, media, experience, upload, point, sort, pageNo, perPage} = req.query;
    if(!pageNo){
        pageNo=1
    }

    if(!perPage){
        perPage=12 
    }

    var campaigns = [];
    var queryObject = {};
    var sortObject = {
        createdAt: -1 
    }

    if(media){
        await updateQueryObject("media", media, async (success, queryValue)=>{
            if(success){
                queryObject["media"] = {
                    $elemMatch: { type: queryValue }
                }
            }
        }, res)
    }

    if(experience){
        await updateQueryObject("experienceMethod", experience, async (success, queryValue)=>{
            if(success){
                queryObject["experienceMethod"] = queryValue
            }
        }, res)
    }
    
    if(upload){
        await updateQueryObject("uploadLocation", upload, async (success, queryValue)=>{
            if(success){
                queryObject["uploadLocation"] = queryValue
            }
        }, res)
    }
    
    if(point){
        await updateQueryObject("pointsMethod", point, async (success, queryValue)=>{
            if(success){
                queryObject["pointsMethod"] = queryValue
            }
        }, res)
    }

    if(sort){
        if(sort == "popularity"){
            sortObject = {
                views: -1
            }
        }else if(sort == "deadline"){
            sortObject = { 
                'applicationPeriod.endDate': 1 
            }
        }else if(sort == "possibility"){
            sortObject = { 
                'recruitRatio': 1 
            }
        }else if(sort == "latest"){
            sortObject = {
                createdAt: -1 
            }
        }else{
            error(res, "Please provide valid sort order method")
        }
    }

    if(category && category.trim() != ""){
        await updateQueryObject("category", category, async (success, queryValue)=>{
            if(success){
                queryObject["category"] = queryValue;
                campaigns = await Campaign.find(queryObject).sort(sortObject).skip((pageNo - 1) * perPage).limit(perPage)
                sendResponse()
            }else{
                error(res, "Some error occured!");
            }
        }, res)
    }else{
        campaigns = await Campaign.find(queryObject).sort(sortObject).skip((pageNo - 1) * perPage).limit(perPage);
        sendResponse()
    }

    async function sendResponse(){
        campaigns = await populateCampaigns(campaigns);
        res.status(200).json(campaigns)    
    }
}

const getCampaignsForApplication = async(req, res)=>{
    var {userid, category, media, experience, upload, point, sort, pageNo, perPage, useLevel = false} = req.query;
    var today = getToday();
    if(!pageNo){
        pageNo=1
    }

    if(!perPage){
        perPage=12 
    }

    var campaigns = [];
    var queryObject = {};
    if(useLevel){
        var user = await User.findById(userid);
        queryObject["creatorLevel"] = user.level;
    }
    var sortObject = {
        createdAt: -1 
    }

    if(media){
        await updateQueryObject("media", media, async (success, queryValue)=>{
            if(success){
                queryObject["media"] = {
                    $elemMatch: { type: queryValue }
                }
            }
        }, res)
    }

    if(experience){
        await updateQueryObject("experienceMethod", experience, async (success, queryValue)=>{
            if(success){
                queryObject["experienceMethod"] = queryValue
            }
        }, res)
    }
    
    if(upload){
        await updateQueryObject("uploadLocation", upload, async (success, queryValue)=>{
            if(success){
                queryObject["uploadLocation"] = queryValue
            }
        }, res)
    }
    
    if(point){
        await updateQueryObject("pointsMethod", point, async (success, queryValue)=>{
            if(success){
                queryObject["pointsMethod"] = queryValue
            }
        }, res)
    }

    if(sort){
        if(sort == "popularity"){
            sortObject = {
                views: -1
            }
        }else if(sort == "deadline"){
            sortObject = { 
                'applicationPeriod.endDate': 1 
            }
        }else if(sort == "possibility"){
            sortObject = { 
                'recruitRatio': 1 
            }
        }else if(sort == "latest"){
            sortObject = {
                createdAt: -1 
            }
        }else{
            error(res, "Please provide valid sort order method")
        }
    }

    queryObject["campaignStatus"] = "prepare"
    queryObject["applicationPeriod.startDate"] = { $lte: today }
    queryObject["applicationPeriod.endDate"] = { $gte: today }
    if(category && category.trim() != ""){
        await updateQueryObject("category", category, async (success, queryValue)=>{
            if(success){
                queryObject["category"] = queryValue;
                campaigns = await Campaign.find(queryObject).sort(sortObject).skip((pageNo - 1) * perPage).limit(perPage)
                sendResponse()
            }else{
                error(res, "Some error occured!");
            }
        }, res)
    }else{
        campaigns = await Campaign.find(queryObject).sort(sortObject).skip((pageNo - 1) * perPage).limit(perPage);
        sendResponse()
    }

    async function sendResponse(){
        campaigns = await populateCampaigns(campaigns);
        res.status(200).json(campaigns)    
    }
}

const getCampaignById = async(req, res)=>{
    var {campaignid} = req.params
    var campaign = await Campaign.findById(campaignid);
    if(!campaign){
        error(res, "Please provide valid campaignid!", true);
        return;
    }

    res.status(200).json(campaign)
}

const duplicateCampaignById = async(req, res)=>{
    var {campaignid} = req.body
    var campaign = await Campaign.findById(campaignid);
    if(!campaign){
        error(res, "Please provide valid campaignid to duplicate!", true);
        return;
    }

    campaign = campaign.toObject();
    // campaign.participants = [];
    // campaign.recruits = [];
    // campaign.rejected = [];
    // campaign.recruitRatio = 0;
    // campaign.views = 0;
    // if(campaign.campaignStatus != "incomplete"){
    //     campaign.campaignStatus = "create";
    // }
    // delete campaign._id
    req.body = campaign;
    await createCampaign(req, res);
}

// #region test edit campaign
// do the work that user can chat with the customer who approved (first check even it is needed according to documentation)


const cancelCampaign = async(req, res)=>{
    const {userid, campaignid, reason} = req.body;
    
    var user = await validateUser(userid, "customer");
    var campaign = await Campaign.findById(campaignid);
    if(!campaign){
        error(res, "Campaign not found")
    }    

    await campaign.updateOne({
        cancellationReason: reason,
        campaignStatus: "cancel"
    })
}

const deleteCampaign = async(req, res)=>{
    try{
        const {userid, campaignid} = req.body;
        
        var campaign = await Campaign.findById(campaignid);
        if(!campaign){
            error(res, "Campaign not found", true)
            return;
        }

        if(campaign.userid != userid){
            error(res, "This campaign cannot be deleted! Not your campaign", true)
            return;
        }

        var participants = campaign.participants;
        await Promise.all(
            participants.map(async participant => {
                await User.updateOne({_id: participant}, {
                    $pull: {
                        campaignsJoined: campaignid
                    }
                })
            })
        )

        await User.updateOne({_id: campaign.userid}, {
            $pull: {
                campaignsCreated: campaignid
            }
        })

        await campaign.deleteOne();

    
        res.status(200).json({
            success: true,
            message: "Campaign Deleted"
        })
    }catch(err){
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

const getUserCampaigns = async(req, res)=>{
    try{
        var {userid} = req.params;

        var user = await User.findById(userid);
        var campaignsList;

        if(user.currentAccountState == "creator"){
            campaignsList = user.campaignsJoined;
        }else if(user.currentAccountState == "customer"){
            campaignsList = user.campaignsCreated;
        }else{
            error(res, "Invalid user account state", true);
            return;
        }
        
        var campaigns = [];

        campaigns = await Promise.all(
            campaignsList.map(async campaignid => {
                return await Campaign.findById(campaignid);
            })
        )

        res.status(200).json(campaigns);
    }catch(error){
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


// test user join for imfact and general campagin
const joinCampaign = async(req, res)=>{
    const {userid, campaignid, acceptJoin = null} = req.body;
    
    var user = await validateUser(userid, "creator");
    user = await User.findById(userid);
    var campaign = await Campaign.findById(campaignid);
    if(campaign.participants.includes(userid)){
        error(res, "You already are participant of this campaign")
    }
    if(campaign.rejected.includes(userid)){
        error(res, "You already are rejected from this campaign")
    }
    if(verifyCampaignStatus(campaign, "recruit", getToday("2024-07-16"))){ //change
        var campaignType = campaign.campaignType;
        await join();
        var message = "";
        if(getSlug(campaignType).includes("general")){
            await addToRecruits();
            await createActivity(userid, "Just wait for customer approval", campaignid, null, {
                type: "approvalWait"
            } );
            message = "Just wait for customer approval"
        }else{
            message = "Confirm to join this campaign";
            if(acceptJoin){
                if(campaign.recruits.includes(userid)){
                    await addToParticipants();
                    await createActivity(userid, "Campaign Joined and approved", campaignid, null, {
                        type: "approved"
                    } );
                }else{
                    message = "something is wrong in request"
                }
        }else{
                await addToRecruits();
                await createActivity(userid, "Do you want to join this campaign", campaignid, null, {
                    type: "campaignJoinQuestion"
                } );
            }
        }

        res.status(200).json({
            success: true,
            message
        })

        async function addToRecruits(){
            if(!campaign.recruits.includes(userid)){
                await campaign.updateOne({
                    $push: {
                        recruits: userid
                    }
                })
            }
        }
        
        async function addToParticipants(){
            if(!campaign.participants.includes(userid)){
                if((user.reviewScore / user.participatedCampaignsCount) > 2.5){
                    await campaign.updateOne({
                        $push: {
                            participants: userid
                        }
                    })
                    message = "Campaign Joined and approved";
                    var newparticipatedCampaignsCount = user.participatedCampaignsCount + 1;
                    await user.updateOne({
                        participatedCampaignsCount: newparticipatedCampaignsCount
                    })
                }else{
                    await createActivity(userid, "Participation rejected due to less scores", campaignid, null, {
                        type: "rejected"
                    } );
                    message = "rejected due to less scores"
                }
            }
        }

        async function join(){
            if(!user.campaignsJoined.includes(campaignid)){
                await user.updateOne({
                    $push: {
                        campaignsJoined: campaignid
                    }
                })
            }
        }
    }else{
        error(res, "Can not join this campaign! Either the registration period ended or the campaign didn't start yet!")
    }
}

const processJoinRequest = async(req, res)=>{
    const {userid, campaignid, processedBy, approved } = req.body;
    
    var message = ""
    var user = await validateUser(userid);
    user = await User.findById(userid);
    var campaign = await Campaign.findById(campaignid);
    if(campaign.userid != processedBy){
        error(res, "You can not approve this user for this campaign")
    }
    if(campaign.participants.includes(userid)){
        error(res, "This use is already participant of this campaign")
    }
    if(campaign.rejected.includes(userid)){
        error(res, "This user is already rejected from this campaign")
    }
    var processor = await validateUser(processedBy, "customer");
    
    if(approved){
        await join();
        await addToParticipants();
        await createActivity(userid, "Campaign Joined and approved", campaignid, null, {
            type: "approved"
        } );
        message = "Campaign Joined and aproved";
    }else{
        await createActivity(userid, "Participation rejected by customer", campaignid, null, {
            type: "rejected"
        } );
        if(!campaign.rejected.includes(userid)){
            await campaign.updateOne({
                $push: {
                    rejected: userid
                }
            })
        }
        message = "Customer rejected you from joining this campaign";
    }

    async function addToParticipants(){
        if(!campaign.participants.includes(userid)){
            await campaign.updateOne({
                $push: {
                    participants: userid
                }
            })
            var newparticipatedCampaignsCount = parseInt(user.participatedCampaignsCount) + 1;
            await user.updateOne({
                participatedCampaignsCount: newparticipatedCampaignsCount
            })
        }
    }

    async function join(){
        if(!user.campaignsJoined.includes(campaignid)){
            await user.updateOne({
                $push: {
                    campaignsJoined: campaignid
                }
            })
        }
    }

    res.status(200).json({
        success: true,
        message
    })
}

const reActivateCampaign = async(req, res)=>{

}



// #endregion Helpers functions start


async function populateCampaigns(campaigns){
    return await Promise.all(
        campaigns.map(async campaign => {
            await campaign.updateOne(
                { $inc: { views: 1 } },
                { new: true, useFindAndModify: false }
            )
            return campaign;
        })
    )
}

async function getAvailableValues(property, slug=true){
    var aucu = await getAucu();
    var campaignUi = aucu.campaignUi;
    var values = campaignUi[property].values;
    if(slug){
        var slugValues = [];
        values.forEach(value => {
            slugValues.push(getSlug(value));
        })
        return {
            values,
            slugValues
        }
    }else{
        return values;
    }
}

function getSlug(string){
    return string.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function getValueOfSlug(slug, values){
    var value = null;
    values.map(v => {
        if(getSlug(v) == slug){
            value = v
            return;
        }
    })
    return value;
}

async function getAucu(){
    var aucu = await Aucu.findOne({});
    if(!aucu){
        aucu = await Aucu.create({});
    }
    return aucu;
}

async function getCampaignOptions(){
    var aucu = await Aucu.findOne({});
    if(!aucu){
        aucu = await Aucu.create({});
    }
    return aucu.campaignOptions;
}

async function getCustomersToApprove(){
    var usersToApprove = await Campaign({
        recruites
    })
}

async function updateQueryObject(query, queryValue, callback, res){
    var queryNames = await getAvailableValues(query);
    if(queryNames.slugValues.includes(queryValue)){
        queryValue = getValueOfSlug(queryValue, queryNames.values)
        if(queryValue){
            callback(true, queryValue);
        }else{
            error(res, `Please provide valid ${query} slug`)
        }
    }else{
        error(res, `Please provide valid ${query} slug`)
    }
}
// Helpers functions end



// Just there for test
async function categoryTestPopulation(req, res){
    var aucu = await getAucu();
    var campaignUi = aucu.campaignUi;
    var categories = campaignUi.category.values;
    var medias = campaignUi.media.values;
    var experiences = campaignUi.experienceMethod.values;
    var uploads = campaignUi.uploadLocation.values;
    var points = campaignUi.pointsMethod.values;

    await Promise.all(
        categories.map(async category => {
            await Promise.all(
                experiences.map(async experience => {
                await Promise.all(
                    uploads.map(async upload => {
                    await Promise.all(
                        points.map(async point => {
                        var mediaArray = [];
                        if(Math.random() >= 0.5){
                            mediaArray.push({
                                type: "Youtube",
                                amount: 1,
                                participantsCount: 11
                            })
                        }
                        if(Math.random() >= 0.5){
                            mediaArray.push({
                                type: "Instagram",
                                amount: 12,
                                participantsCount: 112
                            })
                        }
                        if(Math.random() >= 0.5){
                            mediaArray.push({
                                type: "Twitter",
                                amount: 31,
                                participantsCount: 131
                            })
                        }
                        if(Math.random() >= 0.5){
                            mediaArray.push({
                                type: "Tiktok Shopping",
                                amount: 31,
                                participantsCount: 1541
                            })
                        }

                        var randomViews = Math.floor(Math.random() * 100) + 1;
                        var randomRatio = Math.floor(Math.random() * 10) + 1;


                        function startEndDate(){
                            function randomDate(start, end) {
                            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
                            }
                            
                            // Generate the first random date within a range
                            const startDate = new Date(2020, 0, 1); // Start date range
                            const endDate = new Date(2023, 0, 1);   // End date range
                            const firstDate = randomDate(startDate, endDate);
                            
                            // Generate the second date, which is 2 to 3 days after the first date
                            function randomDateAfter(firstDate) {
                            const daysToAdd = Math.floor(Math.random() * 2) + 2; // Randomly choose between 2 and 3 days
                            const randomHours = Math.floor(Math.random() * 24);
                            const randomMinutes = Math.floor(Math.random() * 60);
                            const randomSeconds = Math.floor(Math.random() * 60);
                            
                            const secondDate = new Date(firstDate);
                            secondDate.setDate(firstDate.getDate() + daysToAdd);
                            secondDate.setHours(randomHours);
                            secondDate.setMinutes(randomMinutes);
                            secondDate.setSeconds(randomSeconds);
                            
                            return secondDate;
                            }
                            
                            const secondDate = randomDateAfter(firstDate);
                            return {
                                startDate: firstDate,
                                endDate: secondDate
                            }
                        }

                        await Campaign.create({
                            userid: "6683bb0b6467454a5e4568cd",
                            campaignType: "impact",
                            category,
                            experienceMethod: experience,
                            uploadLocation: upload,
                            pointsMethod: point,
                            media: mediaArray,
                            title: "Test Campaign",
                            description: "category: ${category}, experience: ${experience}, upload: ${upload}, point: ${point},",
                            applicationPeriod: startEndDate(),
                            contentRegistrationPeriod: startEndDate(),
                            productOffered: "offered descriptiohn",
                            brandName: "random brand",
                            brandLogo: "60413bf9c4b84c74ccca11cf98bad511e881544dac629c51713fcbfc252087a1",
                            resultTypes: "the type sfor random results",
                            mission: "the mission of rnadom campaign for test",
                            contentCreationGuide: "content creation guide for random campaign created for test",
                            titleKeywords: ["keyword", "1"],
                            bodyKeywords: ["keyword", "1"],
                            hashtags: ["#keyword", "#1"],
                            accountTags: ["@keyword", "@1"],
                            emphasizeL: "emphasize for random campaign created for test",
                            toDo: "todo for this test campagin",
                            notToDo: "nottodo for this campaign",
                            landingLink: "the/landin/lingk",
                            productName: "the namefo the prduct",
                            visitAndReservation: "visit and reservatio information for the product",
                            howPurchase: "the descriptin about how to purchase",
                            deliveryAddress: "the delivery address",
                            views: randomViews,
                            recruitRatio: randomRatio
                        })

                    })
                    )
                })
            )
            })
        )
        })
    )

    res.send("done the cmapaign creation process in test mode")

}


async function restoreTestCampaign(req, res){
    var allCampaigns = await Campaign.find({});

    await Promise.all(
        allCampaigns.map(async (campaignd, i) => {
            if(i != 0)
                await allCampaigns[i].deleteOne()
        }
        )
    )

    res.send("done restoreation")
}
//Test ends


function addDays(date, days) {
    const result = getToday(date);
    result.setDate(result.getDate() + days);
    return result;
}

function  calcDate(date, duration, addToStart = 0){
    var startDate = date;
    if(addToStart != 0){
        startDate = addDays(startDate, addToStart)
    }
    var endDate = addDays(startDate, duration);

    return {
        startDate,
        endDate
    }
}

async function getCampaignStatus(req, res){
    var campaign = await Campaign.findById(req.params.campaignid);
    var status = campaignStatus(campaign);
    res.status(200).json({
        status
    })
}

function campaignStatus(campaign, date = getToday()){
    var status = campaign.campaignStatus;
    if(status == "prepare"){
            if(date >= campaign.applicationPeriod.startDate && date <= campaign.applicationPeriod.endDate){
                status = "recruit";  
            }else if(date >= campaign.approvePeriod.startDate && date <= campaign.approvePeriod.endDate){
                status = "approve";  
            }else if(date >= campaign.contentRegistrationPeriod.startDate && date <= campaign.contentRegistrationPeriod.endDate){
                status = "active";  
            }
            else if(date >= campaign.submissionPeriod.startDate && date <= campaign.submissionPeriod.endDate){
                status = "submission";  
            }
            else if(date >= campaign.completePeriod.startDate && date <= campaign.completePeriod.endDate){
                status = "complete";  
            }
            else if(date >= campaign.reviewPeriod.startDate && date <= campaign.reviewPeriod.endDate){
                status = "review";  
            }else{
                if(date >= campaign.reviewPeriod.endDate){
                    status = "archive";  
                }else{
                    status = "none"
                }
            }
            // if(date >= campaign.approvePeriod.startDate && status == "prepare"){
            //     status = "active"
            // }
        
        if(!getSlug(campaign.campaignType).includes("general")){
            console.log(campaign.applicationPeriod.startDate)
            console.log(date);
            console.log(date >= campaign.applicationPeriod.startDate)
            console.log(date <= campaign.applicationPeriod.startDate)
            if(date >= campaign.applicationPeriod.startDate && date <= campaign.applicationPeriod.endDate){
                status = ["recruit", "approve"];  
            }

            if(getSlug(campaign.campaignType).includes("quick")){
                if(date >= campaign.contentRegistrationPeriod.startDate && date <= campaign.contentRegistrationPeriod.endDate){
                    status = ["active", "submission"];  
                }
            }
        }
    }
    console.log("campaign status: ", status)
    return status;
}

function verifyCampaignStatus(campaign, statusVerify, date = getToday()){
    var status = campaignStatus(campaign, date)
    var verifiedStatus = false;
    if(typeof status == "string"){
        if(statusVerify == status){
            verifiedStatus = true;
        }
    }else{
        if(status.includes(statusVerify)){
            verifiedStatus = true;
        }
    }
    return verifiedStatus;
}

function getToday(date){
    var today;
    if(date){
        today = new Date(date);
    }else{
        today = new Date();
    }
    return new Date(today.toISOString().split('T')[0]);
}

module.exports = {createCampaign, updateCampaignUi, getCampaignUi, getCampaigns, categoryTestPopulation, restoreTestCampaign, payForCampaign, getCampaignsForApplication, getCampaignStatus, joinCampaign, processJoinRequest, deleteCampaign, cancelCampaign, getCampaignById, duplicateCampaignById, getUserCampaigns, getmediaLevelLimits}