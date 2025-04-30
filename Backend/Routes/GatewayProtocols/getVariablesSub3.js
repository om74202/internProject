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

const updatesEmitter = require('../updatesEmitter');
const evaluateFormulaExpression = require('../../functions/evalFormula');

const getVariable3 = express.Router();
getVariable3.use(bodyParser.json());

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

getVariable3.post('/subscribeVariables', async (req, res) => {
  const {
    variables, // now expects array of { name, nodeId, expression, frequency }
    endurl,
    securityMode = "none",
    securityPolicy = "none",
    username,
    password
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

      if (username !== "") {
        session = await client.createSession({ userName: username, password: password });
      } else {
        session = await client.createSession();
      }

      activeSubscriptions.set(clientKey, {
        client,
        session,
        subscriptions: new Map(),     // key = frequency
        monitoredItems: new Map()     // key = nodeId
      });
    }

    const results = await Promise.allSettled(
      variables.map(async ({ nodeId, name, expression, frequency }) => {
        const clientStore = activeSubscriptions.get(clientKey);
        const subscriptionKey = `sub_${frequency}`;
        let subscription = clientStore.subscriptions.get(subscriptionKey);

        // Create new subscription for the frequency if not already
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
            console.log(`Subscription terminated for ${clientKey} at frequency ${frequency}`);
          });

          clientStore.subscriptions.set(subscriptionKey, subscription);
        }

        // Create monitored item
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

        clientStore.monitoredItems.set(nodeId, monitoredItem);

        return { nodeId, name, status: "success" };
      })
    );

    const successful = results.filter(r => r.status === "fulfilled").map(r => r.value);
    const failed = results.filter(r => r.status === "rejected").map(r => ({ error: r.reason.message }));

    res.json({
      status: "subscribed",
      connectedTo: endurl,
      successful,
      failed
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


const activeFormulaIntervals = new Map(); // To track running intervals per formula (optional cleanup)

getVariable3.post("/formulaLog", async (req, res) => {
  const { formulas } = req.body;
  console.log("formuals is this " ,formulas)

  if (!Array.isArray(formulas)) {
    return res.status(400).json({ error: "'formulas' must be an array." });
  }

  // if (!frequency || typeof frequency !== "number" || frequency < 1000) {
  //   return res.status(400).json({ error: "'frequency' must be a number in milliseconds (minimum 1000ms)." });
  // }

  // Immediately evaluate once
  const evaluationPromises = formulas.map(async ({ name, expression }) => {
    try {
      const value = await evaluateFormulaExpression(expression);
      const result = { name, expression, value, status: "success" };
      updatesEmitter.emit('formula', result);
      return result;
    } catch (err) {
      return { name, expression, error: err.message, status: "error" };
    }
  });

  try {
    const results = await Promise.all(evaluationPromises);

    // Schedule regular emission
    formulas.forEach(({ name, expression , frequency }) => {
      const key = `${name}-${expression}`;

      // Clear any existing interval for the same formula to avoid duplication
      if (activeFormulaIntervals.has(key)) {
        clearInterval(activeFormulaIntervals.get(key));
      }

      const interval = setInterval(async () => {
        try {
          const value = await evaluateFormulaExpression(expression);
          const result = { name, expression, value, status: "success" };
          updatesEmitter.emit('formula', result);
        } catch (err) {
          console.error(`Error in scheduled formula "${name}":`, err.message);
        }
      }, frequency);

      activeFormulaIntervals.set(key, interval);
    });

    res.json({ message: "Formulas scheduled for regular updates", results });
  } catch (err) {
    res.status(500).json({ error: "Error evaluating formulas", details: err.message });
  }
});


getVariable3.post('/stopAllSubscriptions', async (req, res) => {
  try {
    const stopPromises = [];

    for (const [clientKey, clientData] of activeSubscriptions.entries()) {
      const { client, session, subscriptions } = clientData;

      // Terminate all subscriptions
      for (const subscription of subscriptions.values()) {
        stopPromises.push(subscription.terminate());
      }

      // Close session and disconnect
      stopPromises.push(session.close());
      stopPromises.push(client.disconnect());

      // Clean up map
      activeSubscriptions.delete(clientKey);
    }

    await Promise.all(stopPromises);

    res.json({ message: "All subscriptions and client sessions have been stopped and cleaned up." });
  } catch (err) {
    console.error("Error stopping all subscriptions:", err);
    res.status(500).json({ error: "Failed to stop all subscriptions.", details: err.message });
  }
});



module.exports = getVariable3;


