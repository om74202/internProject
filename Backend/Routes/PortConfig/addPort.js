const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const addPortRoute=express.Router();

addPortRoute.post('/',async(req,res)=>{
    const port=req.body.portNumber;
    var data ="echo iEdge@Opsight2023 | sudo -S ufw allow";
    const command=data+" "+port;
    try{
        const {stdout:stdout}=await exec(command);
    let finalResponse={}

    var data=stdout;
    if(data.trim()== "Rule added\nRule added (v6)"){
        finalResponse={
            response: "Rule Added"
        }
    }
    else{
        finalResponse={
            response: "Failed"
        }
	    console.log(data.trim())
        
    }
    res.json(finalResponse)
    }catch(e){
        console.log(e);
    }
})
module.exports=addPortRoute
