//
const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getMemoryRoute=express.Router();

getMemoryRoute.get('/',async(req,res)=>{
    const command = `free -m | awk 'NR==2{printf "%.2f GB / %.2f GB", $3/1024, $2/1024 }'`;

    try{
        const {stdout:stdout}=await exec(command);
        res.json(stdout);
    }catch(e){
        console.log(e);
    }

})
module.exports=getMemoryRoute
