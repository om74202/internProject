const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const modbusConfigRoute=express.Router();

modbusConfigRoute.post('/',async(req,res)=>{
    const data = req.body;

    // Define default values
    const defaultValues = {
        modbusIpAddress: "127.0.0.1",
        modbusPort: "/dev/ttyUSB0",
        modbusPortTcp: "502",
        regType: "Holding",
        baudRate: "9600",
        parity: "None",
        stopBits: "1",
        byteSize: "8",
        readAddress: "0",
        readCount: "10",
        timeout: "2 second",
        slaveId: [1]
    };
    
    // Merge incoming data with default values
    const config = {
        modbusIpAddress: data.modbusIpAddress || defaultValues.modbusIpAddress,
        modbusPort: data.modbusPort || defaultValues.modbusPort,
        modbusPortTcp: data.modbusPortTcp || defaultValues.modbusPortTcp,
        regType: data.regType || defaultValues.regType,
        baudRate: data.baudRate || defaultValues.baudRate,
        parity: data.parity || defaultValues.parity,
        stopBits: data.stopBits || defaultValues.stopBits,
        byteSize: data.byteSize || defaultValues.byteSize,
        readAddress: data.readAddress || defaultValues.readAddress,
        readCount: data.readCount || defaultValues.readCount,
        timeout: data.timeout || defaultValues.timeout,
        slaveId: Array.isArray(data.slaveId) && data.slaveId.length > 0 ? data.slaveId : defaultValues.slaveId
    };
    
    // Set the payload to the formatted JSON data
    const response= JSON.stringify(config, null, 2); // Pretty print JSON
    const filePath = "/home/admin/Documents/energymeter/modbus.json"; // Path to save the file
    
    const command=`sudo mkdir -p dirname ${filePath} && echo ${response} | sudo tee ${filePath} > /dev/null`
        const {stdout:stdout}=await exec(command);
    
        res.json({
            message:"Sucessfull"
        })

})
module.exports=modbusConfigRoute