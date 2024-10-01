const { paginateArray } = require("ksq-helper");
const Aucu = require("../models/aucuModel");
require('ksq-helper')

const setNotices = async (req, res) => {
    const { notice } = req.body;

    if(notice && notice != ""){
        if(notice.noticeType && notice.text && notice.answer, notice.date){
            var aucu = await getAucu();
    
            await aucu.updateOne({
                $push: {
                    notice
                }
            })
        }else{
            throw Error("Please enter valid format for notice")
        }
    }

    res.status(200).json({
        message: "notice added"
    })
}
const getNotices = async (req, res) => {
    var {pageNo, perPage, type, query} = req.query;
    if(!pageNo){
        pageNo = 1;
    }

    if(!perPage){
        perPage = 10;
    }

    if(!type){
        type="all"
    }
    if(!query){
        query = "";
    }else{
        query = query.toLowerCase();
    }
    var aucu = await getAucu();
    var notices = aucu.notice;

    if(type != "all"){
        var noticesCopy = notices;
        notices=[];
        console.log("notices copy: ", noticesCopy)
        noticesCopy.map(notice=>{
            if(notice.noticeType == type){
                console.log("matched notices: ", notice)
                notices.push(notice);
            }
        })
    }
    if(query != ""){
        var noticesCopy = notices;
        notices=[];
        noticesCopy.map(notice=>{
            if((notice.text.toLowerCase()).includes(query)){
                notices.push(notice);
            }
        })
    }
    notices = paginateArray(notices, perPage, pageNo);

    res.status(200).json({notices});
}


const setFaqs = async (req, res) => {
    const { faq } = req.body;

    if(faq && faq != ""){
        if(faq.faqType && faq.text && faq.answer, faq.date){
            var aucu = await getAucu();
    
            await aucu.updateOne({
                $push: {
                    faqs: faq
                }
            })
        }else{
            throw Error("Please enter valid format for faq")
        }
    }

    res.status(200).json({
        message: "faq added"
    })
}



const getFaqs = async (req, res) => {
    var {pageNo, perPage, type, query} = req.query;
    if(!pageNo){
        pageNo = 1;
    }

    if(!perPage){
        perPage = 10;
    }

    if(!type){
        type="all"
    }
    if(!query){
        query = "";
    }else{
        query = query.toLowerCase();
    }
    var aucu = await getAucu();
    var faqs = aucu.faqs;


    if(type != "all"){
        var faqsCopy = faqs;
        faqs=[];
        console.log("faqs copy: ", faqsCopy)
        faqsCopy.map(faq=>{
            if(faq.faqType == type){
                console.log("matched faqs: ", faq)
                faqs.push(faq);
            }
        })
    }
    if(query != ""){
        var faqsCopy = faqs;
        faqs=[];
        faqsCopy.map(faq=>{
            if((faq.text.toLowerCase()).includes(query)){
                faqs.push(faq);
            }
        })
    }
    faqs = paginateArray(faqs, perPage, pageNo);

    res.status(200).json({faqs});
}

const setPrivacy = async (req, res) => {
    const { privacy } = req.body;

    if(privacy && privacy != ""){
        if(privacy.date && privacy.text){
            var aucu = await getAucu();

            var privacies = aucu.privacy;

            var gotPrivacyDate = false;
            var newPrivacies = privacies.map(privacyPrev => {
                if(getDate(privacyPrev.date) == getDate(privacy.date)){
                    gotPrivacyDate = true;
                    privacyPrev = privacy;
                }
                return privacyPrev;
            })

            if(!gotPrivacyDate){
                newPrivacies.push(privacy);
            }
    

            await aucu.updateOne({
                privacy: newPrivacies
            })
        }else{
            throw Error("Please enter valid format for privacy")
        }
    }

    res.status(200).json({
        message: "privacy added"
    })
}
const getPrivacies = async (req, res) => {
    var aucu = await getAucu();
    var privacies = aucu.privacy;
    res.status(200).json(privacies);
}


const setTerm = async (req, res) => {
    const { term } = req.body;

    if(term && term != ""){
        if(term.date && term.text){
            var aucu = await getAucu();

            var terms = aucu.term;
            var gottermDate = false;
            var newterms = terms.map(termPrev => {
                if(getDate(termPrev.date) == getDate(term.date)){
                    gottermDate = true;
                    termPrev = term;
                }
                return termPrev;
            })

            if(!gottermDate){
                newterms.push(term);
            }
    

            await aucu.updateOne({
                term: newterms
            })
        }else{
            throw Error("Please enter valid format for term")
        }
    }

    res.status(200).json({
        message: "term added"
    })
}
const getTerms = async (req, res) => {
    var aucu = await getAucu();
    var terms = aucu.term;
    res.status(200).json(terms);
}

const setCompanyInfo = async (req, res) => {
    const { companyInfo } = req.body;
        var aucu = await getAucu();
        await aucu.updateOne({
            companyInfo
        })

    res.status(200).json({
        message: "Company Info added"
    })
}
const getCompanyInfo = async (req, res) => {
    var aucu = await getAucu();
    var companyInfo = aucu.companyInfo;
    res.status(200).json(companyInfo);
}

async function getAucu(){
    var aucu = await Aucu.findOne({});
    if(!aucu){
        aucu = await Aucu.create({});
    }
    return aucu;
}

function getDate(date){
    date = new Date(date);
    date = date.toISOString().split('T')[0]
    return date;
}

module.exports = {getCompanyInfo, setCompanyInfo, getTerms, setTerm, getPrivacies, setPrivacy, getFaqs, setFaqs, setNotices,  getNotices}