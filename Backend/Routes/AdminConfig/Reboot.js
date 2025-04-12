const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const rebootRoute=express.Router();

rebootRoute.get('/',async(req,res)=>{
    const command='echo iEdge@Opsight2023 | sudo -S reboot'
    try{
        const {stdout:stdout}=await exec(command);
        res.json({
            message:"Reboot initiated"
        })
    }catch(e){
        console.log(e);
    }
})
module.exports=rebootRoute