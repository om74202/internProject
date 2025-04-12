const express = require("express");
const { exec } = require("child_process");



const getWiFiIpRoute=express.Router();

getWiFiIpRoute.get('/',(req,res)=>{
    exec("ifconfig wlan0 | grep -E -o 'inet [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | awk '{print $2}'", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "Error getting IP address" });
            
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: "Error getting IP address" });
        }
    
        console.log(`Raw Output:\n${stdout}`);
        
        res.json({ip:stdout})
    });

})




module.exports=getWiFiIpRoute;
