const express=require("express")
const {exec} =require('child_process');
const { stdout, stderr } = require("process");

const connectWiFiRoute=express.Router();

connectWiFiRoute.post('/',(req,res)=>{
    const ssid = req.body.ssid; // SSID from POST API Request
    const password = req.body.password; // Password from POST API Request

    if (!ssid || !password) {
        return res.status(400).json({ error: "SSID and password are required" });
      }
      
    
    const command= `echo "iEdge@Opsight2023" | sudo -S nmcli device wifi connect "${ssid}" password "${password}" ifname wlan0`;
    exec(command,(error,stdout,stderr)=>{
        const timestamp = Date.now();

        if (error) {
            console.error(`Error connecting to Wi-Fi: ${error.message}`);
            return res.status(500).json({ error: 'Error connecting to Wi-Fi', details: error.message , timestamp}); 
          }
      
          if (stderr && !stdout.trim()) { 
            console.error(`nmcli stderr: ${stderr}`);
            return res.status(500).json({ error: "Error connecting to Wi-Fi", details: stderr ,timestamp});
        }
      
          console.log(`nmcli stdout: ${stdout}`);
          res.json({ message: 'Wi-Fi connection initiated', output: stdout,timestamp });
    })
})
module.exports=connectWiFiRoute