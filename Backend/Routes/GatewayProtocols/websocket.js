

const WebSocket = require('ws');
const updatesEmitter = require('../updatesEmitter'); // adjust path accordingly
const influxPool = require('../../db/influxPool');
const evaluateExpression = require('../../functions/expressionEval');
const clients = new Set();

module.exports = function setupWebSocket(wss1) {
  wss1.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket 1');
    ws.send('Welcome from wss1');

    ws.on('message', async(msg) => {
      const message=JSON.parse(msg)
      console.log("from websockets");

    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WS1 client disconnected');
    });
  });

  updatesEmitter.on('data', (update) => {
    const message = JSON.stringify(update);
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        const name=update.name;
        const value=update.value;
        const expression=update.expression;
        
        value=evaluateExpression(value+expression);
        influxPool.writeData('opcua_Data2' , {name:name,  value:value} );
      }
    }
  });
};

  
