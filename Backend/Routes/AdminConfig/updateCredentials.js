const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const updateCredentialsRoute=express.Router()

updateCredentialsRoute.get(`/updateCredentials`,async(req,res)=>{
    var changeUserName = req.query.username;
    var changePassword = req.query.password;
    const newCredentials={
        username: changeUserName,
        password: changePassword
    }
    const command=`sudo sed -i 's/"username": *"[^"]*"/"username": "${changeUserName}"/; s/"password": *"[^"]*"/"password": "${changePassword}"/' /home/admin/.node-red-9600/credentials.json`

    try{
        const {stdout:stdout}=await exec(command)

    res.json({
        message:"updated"
    })
    }catch(e){
        console.log(e);
    }
})
module.exports=updateCredentialsRoute
