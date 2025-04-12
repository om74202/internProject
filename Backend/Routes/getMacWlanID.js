const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getMacWlanIDRoute=express.Router();

getMacWlanIDRoute.get('/',async(req,res)=>{
    const command="ifconfig wlan0 | grep -oE '([0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){5})'"

    try{
        const {stdout:stdout}=await exec(command);
	    console.log(stdout.trim())
        res.json({
            macID: stdout.trim().toUpperCase()
        }) 
    }catch(e){
        console.log(e);
    }
})
module.exports=getMacWlanIDRoute
