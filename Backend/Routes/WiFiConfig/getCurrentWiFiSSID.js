const express = require("express");
const { exec } = require("child_process");



const getCurrtenWiFiSSIDRoute=express.Router();

getCurrtenWiFiSSIDRoute.get('/',(req,res)=>{
    exec("iwgetid -r", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).json({ error: "Error getting ssid address" });
            
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            res.status(500).json({ error: "Error getting ssid address" });
        }
    
        //console.log(`Raw Output:\n${stdout}`);
        
        res.json({SSID:stdout})
    });

})




module.exports=getCurrtenWiFiSSIDRoute;
