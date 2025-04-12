const express=require("express")
const {exec} =require('child_process');

const getWiFiRoute=express.Router();

getWiFiRoute.get('/',(req,res)=>{
    const command='nmcli connection show "ETHEREA"'
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "Error getting IP address" });
            
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: "Error getting IP address" });
        }
    
        console.log(`Raw Output:\n${stdout}`);

        const data = stdout.split("\n");
        let staticIP = "";
        let routerIP = "";
        let dnsServer = "";
        let finalIp={};
        
        data.forEach((line) => {
            if (line.includes("ipv4.addresses")) {
                staticIP = line.split(":")[1].trim().split("/")[0];  // Extract IP without subnet mask
            }
            if (line.includes("ipv4.gateway")) {
                routerIP = line.split(":")[1].trim();  // Extract gateway
            }
            if (line.includes("ipv4.dns")) {
                dnsServer = line.split(":")[1].trim();  // Extract DNS
            }
        });
        
        finalIp= [{
            name: "static_eth0",
            staticIP: staticIP || "",
            routerIP: routerIP || "",
            dnsServer: dnsServer || ""
        }];
        res.json(finalIp)
    })
})
module.exports=getWiFiRoute