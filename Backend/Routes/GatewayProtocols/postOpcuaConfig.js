
// const express=require("express")
// const util = require("util");
// const exec = util.promisify(require("child_process").exec);

// const opcuaConfigRoute=express.Router();

// opcuaConfigRoute.post('/',async(req,res)=>{
//     const data = req.body;

//     // Define default values
//     const defaultValues = {
//         endurl: "",
//         securityMode: "none",
//         password: "",
//         securityPolicy: "",
//         username: "",
//         certificate: "None",
//     };
    
//     // Merge incoming data with default values
//     const config = {
//         endurl: data.endurl || defaultValues.endurl,
//         securityMode: data.securityMode || defaultValues.securityMode,
//         password: data.password,
//         securityPolicy: data.securityPolicy,
//         username: data.username,
//         certificate:data.certificate,
//     };
    
//     // Set the payload to the formatted JSON data
//     const response= JSON.stringify(config, null, 2); // Pretty print JSON
//     const filePath = "/home/admin/Documents/energymeter/opcua.json"; // Path to save the file
    
    
//     const command=`sudo mkdir -p $(dirname ${filePath}) && sudo tee ${filePath} > /dev/null <<EOF ${iniContent} EOF`
//     const {stdout:stdout}=await exec(command);
    
//         res.json({
//             message:"Sucessfull"
//         })

// })
// module.exports=opcuaConfigRoute;

const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const opcuaConfigRoute = express.Router();

opcuaConfigRoute.post("/", async (req, res) => {
  try {
    const data = req.body;

    // Define default values
    const defaultValues = {
      endurl: "",
      securityMode: "none",
      password: "",
      securityPolicy: "",
      username: "",
      certificate: "None",
    };

    // Merge incoming data with default values
    const config = {
      endurl: data.endurl || defaultValues.endurl,
      securityMode: data.securityMode || defaultValues.securityMode,
      password: data.password || defaultValues.password,
      securityPolicy: data.securityPolicy || defaultValues.securityPolicy,
      username: data.username || defaultValues.username,
      certificate: data.certificate || defaultValues.certificate,
    };

    // Path where the file should be saved
    const filePath = "/home/admin/Documents/energymeter/opcua.json";

    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Write the file
    await fs.writeFile(filePath, JSON.stringify(config, null, 2), "utf8");

    res.json({
      message: "Config saved successfully",
      filePath,
    });
  } catch (err) {
    console.error("Error writing OPC UA config:", err);
    res.status(500).json({
      message: "Failed to write config file",
      error: err.message,
    });
  }
});

module.exports = opcuaConfigRoute;


