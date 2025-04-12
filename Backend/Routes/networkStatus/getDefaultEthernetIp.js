const express=require("express")
const {exec}=require("child_process");

const getDefaultEthernetIPRoute=express.Router();

getDefaultEthernetIPRoute.get('/',(req,res)=>{
    const command="nmcli connection show 'Wired connection 1' | grep ipv4.addresses | awk '{print $2}'"
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "Error getting IP address" });
            
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: "Error getting IP address" });
        }
    
        console.log(stdout)
     res.json({ip:stdout});
    });

})

module.exports=getDefaultEthernetIPRoute

