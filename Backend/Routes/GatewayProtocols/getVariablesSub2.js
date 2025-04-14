const express = require('express');
const bodyParser = require('body-parser');
const {
  OPCUAClient,
  AttributeIds,
  ClientSubscription,
  ClientMonitoredItem,
  MessageSecurityMode,
  SecurityPolicy,
  DataType
} = require('node-opcua');

const updatesEmitter = require('../updatesEmitter')

const getVariable2 = express.Router();
getVariable2.use(bodyParser.json());

const activeSubscriptions = new Map();

const securityPolicyMap = {
  "basic256sha256": SecurityPolicy.Basic256Sha256,
  "basic128rsa15": SecurityPolicy.Basic128Rsa15,
  "basic256": SecurityPolicy.Basic256,
  "none": SecurityPolicy.None
};

const securityModeMap = {
  "none": MessageSecurityMode.None,
  "sign": MessageSecurityMode.Sign,
  "signandencrypt": MessageSecurityMode.SignAndEncrypt
};

getVariable2.post('/subscribe', async (req, res) => {
  const {
    variables,
    endurl,
    securityMode = "none",
    securityPolicy = "none",
    username,
    password,
    frequency = 1000
  } = req.body;

  const clientKey = `${endurl}_${username || 'anonymous'}`;

  try {
    let { client, session } = activeSubscriptions.get(clientKey) || {};

    if (!client) {
      client = OPCUAClient.create({
        connectionStrategy: {
          maxRetry: 3,
          initialDelay: 1000,
          maxDelay: 5000
        },
        securityMode: securityModeMap[securityMode.toLowerCase()],
        securityPolicy: securityPolicyMap[securityPolicy.toLowerCase()],
        endpointMustExist: true
      });

      client.on("connection_lost", () => {
        console.log(`Connection lost to ${endurl}`);
        activeSubscriptions.delete(clientKey);
      });

      await client.connect(endurl);
      session = await client.createSession(
        username ? { userName: username, password } : { type: "anonymous" }
      );

      activeSubscriptions.set(clientKey, {
        client,
        session,
        subscriptions: new Map(),
        monitoredItems: new Map()
      });
    }

    const subscriptionKey = `sub_${frequency}`;
    let subscription = activeSubscriptions.get(clientKey).subscriptions.get(subscriptionKey);

    if (!subscription) {
      subscription = ClientSubscription.create(session, {
        requestedPublishingInterval: frequency,
        requestedLifetimeCount: 100,
        requestedMaxKeepAliveCount: 10,
        maxNotificationsPerPublish: 100,
        publishingEnabled: true,
        priority: 100
      });

      subscription.on("terminated", () => {
        console.log(`Subscription terminated for ${clientKey}`);
      });

      activeSubscriptions.get(clientKey).subscriptions.set(subscriptionKey, subscription);
    }

    const monitoringResults = await Promise.allSettled(
      variables.map(async ({ nodeId, name , expression }) => {
        const monitoredItem = ClientMonitoredItem.create(
          subscription,
          { nodeId, attributeId: AttributeIds.Value },
          {
            samplingInterval: frequency,
            discardOldest: true,
            queueSize: 10
          }
        );

        monitoredItem.on("changed", (dataValue) => {
          const update = {
            endpoint: endurl,
            nodeId,
            name,
            expression,
            value: dataValue.value.value,
            status: dataValue.statusCode.name,
            timestamp: new Date(),
            dataType: DataType[dataValue.value.dataType]
          };
          updatesEmitter.emit('data', update);
        });

        monitoredItem.on("err", (err) => {
          console.error(`Monitoring error for ${name}:`, err);
        });

        activeSubscriptions.get(clientKey).monitoredItems.set(nodeId, monitoredItem);
        return { nodeId, name, status: "success" };
      })
    );

    const successful = monitoringResults.filter(r => r.value?.status === "success");
    const failed = monitoringResults.filter(r => r.value?.status === "error");

    res.json({
      status: "subscribed",
      connectedTo: endurl,
      successful: successful.map(r => r.value),
      failed: failed.map(r => r.value)
    });

  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ error: error.message });

    if (activeSubscriptions.has(clientKey)) {
      const { client, session } = activeSubscriptions.get(clientKey);
      await session?.close();
      await client?.disconnect();
      activeSubscriptions.delete(clientKey);
    }
  }
});

module.exports = getVariable2;
