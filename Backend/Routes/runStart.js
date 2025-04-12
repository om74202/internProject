const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const runStartRoute=express.Router();

runStartRoute.post('/',async(req,res)=>{
    const command=req.body.command;
    const filePath=req.body.filePath;
    const command2=`cd ${filePath} && ${command}`
    try{
        const {stdout:stdout}=await exec(command2);

    res.json({
        message:"sucessfull"
    })
    }catch(e){
        console.log(e);
    }
})
module.exports=runStartRoute