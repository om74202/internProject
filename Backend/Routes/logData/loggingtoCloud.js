const express = require('express');
const CloudInfluxPool = require('../../db/cloudInfluxPool');
const evaluateExpression = require('../../functions/expressionEval');
const evaluateFormulaExpression = require('../../functions/evalFormula');
const loggingtoCloudRoute = express.Router();// Adjust path as needed

// POST endpoint for writing OPC data
loggingtoCloudRoute.post('/', async (req, res) => {
  try {
    const { name , value , expression } = req.body;

    // Validate input
    if (!name || value === undefined || value === null) {
      return res.status(400).json({ 
        error: 'Both nodeId and value are required' 
      });
    }
    const valuef=await evaluateFormulaExpression(value+expression)

    CloudInfluxPool.writeData('OpcuaVariable' , {name} , {valuef})
    console.log("data to Cloud" , name ,value , valuef)

    res.status(200).json({ 
      success: true,
      message: 'Data queued for writing to InfluxDB cloud'
    });

  } catch (error) {
    console.error('Error writing OPC data:', error);
    res.status(500).json({ 
      error: 'Failed to process data',
      details: error.message 
    });
  }
});
module.exports = loggingtoCloudRoute;