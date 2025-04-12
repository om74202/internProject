const express = require('express');
const CloudInfluxPool = require('../../db/cloudInfluxPool');
const loggingtoCloudRoute = express.Router();// Adjust path as needed

// POST endpoint for writing OPC data
loggingtoCloudRoute.post('/', async (req, res) => {
  try {
    const { nodeId, value } = req.body;

    // Validate input
    if (!nodeId || value === undefined || value === null) {
      return res.status(400).json({ 
        error: 'Both nodeId and value are required' 
      });
    }

    // Write to InfluxDB
    CloudInfluxPool.writeData(
      'opc_data_Cloud',
      { value }, // Field(s) being stored
      { nodeId } // Tag(s) for filtering
    );

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