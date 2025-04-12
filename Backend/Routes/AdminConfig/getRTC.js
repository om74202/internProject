//

const express=require("express")
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const getRTCRoute=express.Router()

getRTCRoute.get('/',async(req,res)=>{
    const command='date +"%Y-%m-%d %H:%M"'

    try{
        const {stdout:stdout}=await exec(command)
        let finalAns={}

        var data = stdout;
        var date = data.slice(0, 10);  // Extract date (YYYY-MM-DD)
        var time24 = data.slice(11);   // Extract time (HH:MM:SS or HH:MM)
        
        // Split the time into hours, minutes, and seconds (if available)
        var timeParts = time24.split(":");
        var hours = parseInt(timeParts[0], 10);
        var minutes = timeParts[1];
        var seconds = timeParts.length > 2 ? timeParts[2] : "00";  // Default to "00" if seconds are undefined
        
        // Determine AM or PM
        var ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert 24-hour time to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12;  // The hour '0' should be '12'
        
        // Format the time as HH:MM:SS AM/PM
        var time12 = hours + ":" + minutes + ":" + seconds + " " + ampm;
        
        // Set the output payload with the date and time in AM/PM format
        finalAns= {
            date: date,
            time: time12
        };
        
        res.json(finalAns)

    }catch(e){
        console.log(e)
    }
})
module.exports=getRTCRoute