

const WebSocket = require('ws');
const updatesEmitter = require('../updatesEmitter'); // adjust path accordingly

const clients = new Set();

module.exports = function setupWebSocket(wss1) {
  wss1.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket 1');
    ws.send('Welcome from wss1');

    ws.on('message', (msg) => {
      console.log('WS1 message:', msg.toString());
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
      }
    }
  });
};

  
