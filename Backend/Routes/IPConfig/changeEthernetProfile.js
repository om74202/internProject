const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const changeEthernetProfileRouter=express.Router();

changeEthernetProfileRouter.post('/',async (req,res)=>{
    const command='echo iEdge@Opsight2023 | sudo -S cat /etc/NetworkManager/system-connections/ETHEREA.nmconnection'
    try{
        const {stdout:stdout}=await exec(command)

        var formData = req.body;
        var fileData = stdout;
        var fileDataArray = fileData.split("\n");
        let newConfig={}
        
        // Check if there is already a profile for this routerIP (using 'gateway' field)
        var gatewayMatch = "gateway=" + formData.routerIP;
        
        var matchFlag = false;
        
        fileDataArray.forEach((line, index) => {
            // Check if there is an existing profile for this router IP
            if (line === gatewayMatch) {
//                node.warn("Editing Profile");
                // Modify IP address, gateway, and DNS
                fileDataArray.splice(index - 1, 1, "addresses=" + formData.staticIP + "/24");
                fileDataArray.splice(index + 1, 1, "dns=" + formData.dnsServer + ";");
                matchFlag = true;
            }
        });
        
        if (!matchFlag) {
            // If no existing profile, create a new one
  //          node.warn("Adding new Profile");
            fileDataArray.push("[ipv4]");
            fileDataArray.push("method=manual");
            fileDataArray.push("addresses=" + formData.staticIP + "/24");
            fileDataArray.push("gateway=" + formData.routerIP);
            fileDataArray.push("dns=" + formData.dnsServer + ";");
        }
        
        newConfig= fileDataArray.join("\n");
        
        const command2 = `echo "${newConfig}" | sudo tee /etc/NetworkManager/system-connections/Wired\\ connection\\ 1.nmconnection > /dev/null`;

        const {stdout:stdout2}=await exec(command2)
        var verifyFileData = stdout2.split("\n");
        let req2 = "addresses=" + req.body.staticIP;
        let finalResponse=false;
        
        // Verify if the IP address was set correctly
        if (verifyFileData.includes(req2)) {
            finalResponse= {
                response: "true"
            };
        } else {
            finalResponse = {
                response: "false"
            };
        }

        res.json(finalResponse);

    }catch(e){
        console.log(e);
    }
    
})
module.exports=changeEthernetProfileRouter
