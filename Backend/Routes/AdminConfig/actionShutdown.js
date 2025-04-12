const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);
//echo iEdge@Opsight2023 | sudo -S shutdown -h now

const  actionShutdownRoute=express.Router();

actionShutdownRoute.get('/',async(req,res)=>{
    const command='echo iEdge@Opsight2023 | sudo -S shutdown -h now';
    try{
        const {stdout:stdout}=await exec(command);
        console.log(stdout);
        res.json({message:"done"})
    }catch(e){
        console.log(e);
    }
})
module.exports=actionShutdownRoute;