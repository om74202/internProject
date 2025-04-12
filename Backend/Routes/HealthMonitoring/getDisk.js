const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getDiskRoute=express.Router();

getDiskRoute.get('/',async(req,res)=>{
    const command ="df -BG / | awk 'NR==2{printf \"%d GB / %d GB\", \$3, \$2}'";
    try{
        const {stdout:stdout}=await exec(command);
        res.json(stdout);
    }catch(e){
        console.log(e);
    }

})
module.exports=getDiskRoute
