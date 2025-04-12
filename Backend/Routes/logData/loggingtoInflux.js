const express = require('express');
const influxPool = require('../../db/influxPool');
const loggingtoInfluxRoute = express.Router();// Adjust path as needed

// POST endpoint for writing OPC data
loggingtoInfluxRoute.post('/', async (req, res) => {
  try {
    const { nodeId , value } = req.body;

    // Validate input
    if (!nodeId || value === undefined || value === null) {
      return res.status(400).json({ 
        error: 'Both nodeId and value are required' 
      });
    }


    // Write to InfluxDB
    influxPool.writeData(
      'opc_data3',
      { value }, // Field(s) being stored
      { nodeId } // Tag(s) for filtering
    );

    res.status(200).json({ 
      success: true,
      message: 'Data queued for writing to InfluxDB'
    });

  } catch (error) {
    console.error('Error writing OPC data:', error);
    res.status(500).json({ 
      error: 'Failed to process data',
      details: error.message 
    });
  }
});
module.exports = loggingtoInfluxRoute;