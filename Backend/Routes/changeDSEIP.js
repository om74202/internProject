const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const changeDSEIPRoute=express.Router();

changeDSEIPRoute.post('/',async (req,res)=>{
    const command='echo iEdge@Opsight2023 | sudo chmod 777 "/etc/NetworkManager/system-connections/Wired connection 2.nmconnection" && cat "/etc/NetworkManager/system-connections/Wired connection 2.nmconnection"'
    const command2='echo iEdge@Opsight2023 | sudo nmcli connection reload'
    const command3='echo iEdge@Opsight2023 | sudo nmcli connection up "Wired connection 2"'
    try{
        const { stdout: stdout } = await exec(command);
        const fileData = stdout.split("\n");
        var staticIPAddress = req.body.staticIP;
        let finalIp={}
        
        fileData.forEach((line, index) => {
            if (line.includes("[ipv4]")) {
                // Update the addresses field with the new static IP
                fileData.forEach((innerLine, innerIndex) => {
                    if (innerLine.includes("addresses=")) {
                        fileData.splice(innerIndex, 1, "addresses=" + staticIPAddress + "/24");
                    }
                });
            }
        });
        finalIp= fileData.join("\n");
        console.log(finalIp)

        const command4='sudo tee /etc/NetworkManager/system-connections/Wired\ connection\ 2.nmconnection <<< "$finalIp"'
        const {stdout:stdout4}=await exec(command4);
        const {stdout:stdout2}=await exec(command2);
        const {stdout:stdout3}=await exec(command3);

        var verifyFileData = stdout3.split("\n");
        const  req = "addresses=" + req.body.staticIP + "/24";
        let finalResponse={}
        
        // Check if the file contains the new static IP
        if(verifyFileData.includes(req)) {
            finalResponse= {
                response: "true"
            };
        } else {
            finalResponse = {
                response: "false"
            };
        }
        res.json(finalResponse)
    }catch(e){
        console.log(e);
    }

})
module.exports=changeDSEIPRoute;