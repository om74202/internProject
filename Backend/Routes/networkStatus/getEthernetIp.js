const express=require("express")
const getCommandResponse = require("../../functions/commands");
const {exec}=require("child_process")
const getEthernetIpRoute=express.Router();

getEthernetIpRoute.get('/',(req,res)=>{
    const command="ifconfig eth0 | grep -E -o 'inet [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'| cut -d '' -f2 | awk '{print $2}'"

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "Error getting IP address" });
            
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: "Error getting IP address" });
        }
    
        res.json({ip:stdout});
    });
        
})

module.exports=getEthernetIpRoute;
