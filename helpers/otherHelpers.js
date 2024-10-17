const User = require("../models/userModel");
const path = require("path")
const fs = require('fs');
const os = require('os');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const crypto = require("crypto");
require("dotenv").config();

const randomName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

var db = {
  findOne: async function(model, params){
    params['deleted'] = false;
    var result = await model.findOne(params);
    return result;
  },
  
  find: async function(model, params, skip = null, limit = null, sort = null){
    params['deleted'] = false;
    var result;
    if(skip && limit && sort){
      result = await model.find(params)
        .skip(skip)
        .limit(limit)
        .sort(sort);
    }
    result = await model.find(params);
    return result;
  },

  findById: async function(model, id){
    var params = {
      _id: id,
    }
    params['deleted'] = false;
    var result = await model.findOne(params);
    return result;
  },
}

const getServerIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address; // Return the external IPv4 address
      }
    }
  }
  throw new Error('No external IPv4 address found');
};

var is = {  // Image Server
  
  upload: async function (file){

    var fileName = `${randomName()}${path.extname(file.originalname)}`;
    const storagePath = path.join(__dirname, 'public', 'storage', fileName);
  
    try {
      await writeFile(storagePath, file.buffer);
      const serverIP = getServerIP();  
    return `https://${serverIP}/storage/${fileName}`;
    } catch (err) {
      console.error(err.message);
      throw Error("Error: ", err.message)
    }
  }
}

function tryCatch(callback, res=null){
  try{
      callback()
  }catch(error){
      if(res){
          error(res, error.message);
      }else{
          throw Error(error.message);
      }
  }
}

function error(res, error, notThrow = false){
  if(res){
    res.status(400).json({
        success: false,
        message: error
    })
  }

  if(!notThrow){
    throw Error(error)
  }
}

function truncateString(str, maxLength) {
  if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...';
  }
  return str;
}

function paginateArray(array, perPage, pageNo) {
  const startIndex = (pageNo - 1) * perPage;
  return array.slice(startIndex, startIndex + perPage);
}

  module.exports = { db, is, tryCatch, error, truncateString, paginateArray }