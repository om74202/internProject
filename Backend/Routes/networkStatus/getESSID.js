const express=require("express")
const {exec} =require('child_process')

const getESSIDRoute=express.Router()

getESSIDRoute.get('/',(req,res)=>{
    exec("iwgetid",(error,stdout,stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
    const length=stdout.length;
    const SSID=data.slice(17,length-1);
    const ssid=SSID.replace(/"/g,'');
    let finalAns={SSID:"NOT CONNECTED"};
    if(ssid!==''){
        finalAns={
        SSID:ssid
    }
    }
    console.log(finalAns)
    res.json(finalAns.SSID)
    },)
})
module.exports=getESSIDRoute