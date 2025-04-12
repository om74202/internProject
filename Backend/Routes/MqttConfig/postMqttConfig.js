const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const postMqttConfigRoute=express.Router();

postMqttConfigRoute.post('/',async(req,res)=>{

    const data = req.body;
    let response={};

    // Define required fields
    const requiredFields = ["brokerAddress", "port", "username", "password", "topic", "qos"];
    
    // Check for missing fields
    try{
        const missingFields = requiredFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
        return res.json({
            error: `Missing required fields: ${missingFields.join(", ")}`
        })
    }
    
    // Format the data as INI
    const iniContent = `
    [MQTT]
    broker = ${data.brokerAddress}
    port = ${data.port}
    username = ${data.username}
    password = ${data.password}
    topic = ${data.topic}
    qos = ${data.qos}
    `.trim();
    
    // Set up the payload and file path for the file node
    response= iniContent;
    let filePath = "/home/admin/Documents/energymeter/mqtt_config.ini"; // Adjust the path as needed

    const command=`sudo mkdir -p $(dirname ${filePath}) && sudo tee ${filePath} > /dev/null <<EOF ${iniContent} EOF`
    const {stdout:stdout}=await exec(command);

    res.json({
        message:"Sucessfull"
    })
    }catch(e){
        console.log(e)
    }


})
module.exports=postMqttConfigRoute
