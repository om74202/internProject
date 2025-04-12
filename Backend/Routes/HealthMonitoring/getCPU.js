const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getCPURoute=express.Router();

getCPURoute.get('/',async(req,res)=>{
    const command = 'top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1 "%"}\'';
    try{
        const {stdout:stdout}=await exec(command);
        res.json(stdout.trim());
    }catch(e){
        console.log(e);
    }

})
module.exports=getCPURoute
