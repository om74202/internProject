//echo iEdge@Opsight2023 | sudo -S vcgencmd measure_temp
const express=require("express")
const util = require("util");
const cors=require("cors")
const exec = util.promisify(require("child_process").exec);

const getTempRoute=express.Router();

getTempRoute.get('/',async(req,res)=>{
    const command='echo iEdge@Opsight2023 | sudo -S vcgencmd measure_temp |  awk -F"=" "{print $2}" '
    //const command = `ssh -i ${sshKeyPath} ${piUser}@${piHost} "  sudo -S vcgencmd measure_temp | awk -F'=' '{print $2}'"`;
    try{
        const command="echo 'iEdge@Opsight2023' | sudo vcgencmd measure_temp "
    //const command = `ssh -i ${sshKeyPath} ${piUser}@${piHost} "  sudo -S vcgencmd measure_temp | awk -F'=' '{print $2>    try{
        const {stdout}=await exec(command);
        const temp=stdout.trim().slice(-6);
        res.json(`${temp}`);
    }catch(e){
        console.log(e);
    }
})
module.exports=getTempRoute