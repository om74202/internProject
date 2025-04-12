const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const deletePortRoute=express.Router();

deletePortRoute.post('/',async(req,res)=>{
    const port=req.body.portNumber;
    var data ="echo iEdge@Opsight2023 | sudo -S ufw deny";
    const command=data+" "+port;
    try{
        const {stdout:stdout}=await exec(command);
    let finalResponse={}

    var data=stdout;
    if(data.trim()== "Rule updated\nRule updated (v6)"){
        finalResponse={
            response: "Rule deleted"
        }
    }
    else{
        finalResponse={
            response: "Failed"
        }
        
    }
    res.json(finalResponse)
    }catch(e){
        console.log(e);
    }
})
module.exports=deletePortRoute
