const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const changeWiFiProfileRouter=express.Router();

changeWiFiProfileRouter.post('/',async (req,res)=>{
    
})