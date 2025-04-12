const express = require("express");
const { exec } = require("child_process");

const getWiFiNetworksRoute=express.Router();

getWiFiNetworksRoute.get('/',(req,res)=>{
const command="echo 'iEdge@Opsight2023' | sudo iw dev wlan0 scan | grep 'SSID' | awk -F ': ' '{print $2}'"
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "Error getting IP address" });
            
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: "Error getting IP address" });
        }
    
        const networks = stdout
            .split("\n") // Split by new lines
            .map(name => name.trim()) // Trim whitespace
            .filter(name => name.length > 0); // Remove empty values
console.log(networks)

        res.json(networks)



    })
})
module.exports=getWiFiNetworksRoute
