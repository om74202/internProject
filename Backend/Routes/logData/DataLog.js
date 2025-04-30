
const express=require('express');
const axios=require('axios')

const DataLogRouter=express.Router();
const baseURL="http://localhost:3001"
let dataLogSocket = null;





DataLogRouter.post('/startDataLog', async (req, res) => {
    const { servers } = req.body;
  
    try {
      for (const serverName of servers) {
        const serverData = await axios.get(`${baseURL}/addVariable/opcuaData/${serverName}`);
        const variablesRes = await axios.get(`${baseURL}/addVariable/onlyVariable/${serverName}`);
        const variableNameValue = variablesRes.data.map(item => ({
          name: item.name,
          nodeId: item.nodeId,
          expression: item.expression,
          frequency: item.frequency
        }));



  
        const res=await axios.post(`${baseURL}/subscribeVariables`, {
          variables: variableNameValue,
          endurl: serverData.data.endurl,
          username: serverData.data.username,
          password: serverData.data.password,
          securePolicy: serverData.data.securityPolicy,
          securityMode: serverData.data.securityMode,
          certificate: serverData.data.certificate
        });
        const responseFormulas = await axios.get(`${baseURL}/addFormula/onlyFormula/${serverName}`);
        const response3 = await axios.post(`${baseURL}/formulaLog` , {
          formulas:responseFormulas.data
        })

    if (dataLogSocket && dataLogSocket.readyState === WebSocket.OPEN) {
  dataLogSocket.close();
}
dataLogSocket = new WebSocket("ws://localhost:3001");

      }
  
      res.status(200).json({ message: 'Data log started successfully' });
    } catch (error) {
      console.error('Error in startDataLog:', error);
      res.status(500).json({ error: 'Failed to start data log' });
    }
  });


  DataLogRouter.post('/stopDataLog', (req, res) => {
    if (dataLogSocket && dataLogSocket.readyState === WebSocket.OPEN) {
      dataLogSocket.close(1000, 'Stopped by user');
      dataLogSocket = null;
      return res.json({ message: 'WebSocket closed successfully' });
    } else {
      return res.status(400).json({ message: 'No active WebSocket to close' });
    }
  });
  

  module.exports=DataLogRouter;

  