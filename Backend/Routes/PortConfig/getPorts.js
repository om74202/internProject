const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getPortsRoute=express.Router();

getPortsRoute.get('/',async (req,res)=>{
    const command='echo iEdge@Opsight2023 | sudo -S ufw show added'
    try{
        const {stdout:stdout}=await exec(command);

        var data=stdout.split("\n");
        const ports=[];
        var digitExpression=/\d/;
        //node.warn(data)
        data.forEach((line,index)=>{
            //node.warn(line)
            if(digitExpression.test(line) && line.search("deny")==-1){
                //node.warn(line);
                var allowedPort=data[index].slice(10,data[index].length)
                if (allowedPort !== "9600" && allowedPort !== "80") {
                    ports.push(allowedPort); // Add allowed ports except 5900 and 80
                }
                //ports.push(allowedPort);
                //node.warn(ports);
                
            }
        })
        res.json(ports);
    }catch(e){
        console.log(e);
    }
})
module.exports=getPortsRoute
