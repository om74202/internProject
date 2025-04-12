const express = require('express');
const bodyParser = require('body-parser');
const {
  OPCUAClient,
  AttributeIds,
  TimestampsToReturn,
  ClientSubscription,
  ClientMonitoredItem,
  MessageSecurityMode,
  SecurityPolicy,
  UserIdentityInfoUserName
} = require('node-opcua');
const EventEmitter = require('events');
const getVariablesSubRoute = express.Router();
getVariablesSubRoute.use(bodyParser.json());

const updatesEmitter = new EventEmitter();

let opcuaClient, session, subscription;
let monitoredItems = [];


getVariablesSubRoute.post('/subscribe', async (req, res) => {
  const {variables , nodeIds  , endpointUrl , username , password , securityMode , securityPolicy} = req.body;

  if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
    return res.status(400).json({ error: "nodeIds must be a non-empty array" });
  }

  try {
    // 1. Create secure OPC UA client
    opcuaClient = OPCUAClient.create({
      securityMode,
      securityPolicy,
      endpointMustExist: true
    });

    await opcuaClient.connect(endpointUrl);

    // 2. Authenticate using username/password
    session = await opcuaClient.createSession({
      type: "userName",
      userName: username,
      password: password
    });

    // 3. Create a subscription
    subscription = ClientSubscription.create(session, {
      requestedPublishingInterval: 200,
      requestedLifetimeCount: 1000,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 20,
      publishingEnabled: true,
      priority: 10
    });

    monitoredItems = [];

    for (const nodeId of nodeIds) {
      const itemToMonitor = {
        nodeId,
        attributeId: AttributeIds.Value
      };

      const parameters = {
        samplingInterval: 200,
        discardOldest: true,
        queueSize: 10
      };

      const monitoredItem = ClientMonitoredItem.create(
        subscription,
        itemToMonitor,
        parameters,
        TimestampsToReturn.Both
      );

      monitoredItem.on("changed", (dataValue) => {
        const value = dataValue.value.value;
        updatesEmitter.emit("update", { nodeId, value });
      });

      monitoredItems.push(monitoredItem);
    }

    res.json({ message: "Subscribed with security and authentication", nodeIds });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/updates', (req, res) => {
  const onUpdate = (update) => {
    res.json(update);
    updatesEmitter.removeListener("update", onUpdate);
  };

  updatesEmitter.once("update", onUpdate);

  setTimeout(() => {
    updatesEmitter.removeListener("update", onUpdate);
    res.status(204).end(); // no content
  }, 10000); // 10s timeout
});


