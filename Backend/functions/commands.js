const {exec}=require('child_process')

const getCommandResponse=(command)=>{
    const response=exec(command,(error,stdout,stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Output:\n${stdout}`)
    },)
    return response;
}

module.exports=getCommandResponse;