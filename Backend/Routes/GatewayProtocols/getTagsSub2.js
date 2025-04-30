const { pool } = require("../../db/db");

module.exports = (wss2) => {
    const express = require("express");
    const WebSocket = require("ws");
    const {
        OPCUAClient,
        AttributeIds,
        SecurityPolicy,
        MessageSecurityMode,
        ClientSubscription,
        ClientMonitoredItem,
        DataType
    } = require("node-opcua");

    const RetentionTagsRoute = express.Router();
    const activeSubscriptions = new Map(); // Track active subscriptions by session

    wss2.on("connection", (ws) => {
        ws.on("close", () => {
            // Optional: Cleanup logic
        });
    });

    RetentionTagsRoute.post("/", async (req, res) => {
        const {
            endUrl,
            nodeIds = [],
            username,
            password,
            securityPolicy,
            securityMode,
            certificate,
            frequency = 1000
        } = req.body;

        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
            return res.status(400).json({ error: "nodeIds must be a non-empty array" });
        }

        const securityPolicyMap = {
            "basic256sha256": SecurityPolicy.Basic256Sha256,
            "basic128rsa15": SecurityPolicy.Basic128Rsa15,
            "basic256": SecurityPolicy.Basic256,
            "none": SecurityPolicy.None,
            "basic192": SecurityPolicy.Basic192,
            "basic192rsa15": SecurityPolicy.Basic192Rsa15
        };

        const securityModeMap = {
            "none": MessageSecurityMode.None,
            "sign": MessageSecurityMode.Sign,
            "signandencrypt": MessageSecurityMode.SignAndEncrypt
        };

        const securityPolicyConstant = securityPolicyMap[securityPolicy?.toLowerCase()] || SecurityPolicy.None;
        const securityModeConstant = securityModeMap[securityMode?.toLowerCase()] || MessageSecurityMode.None;

        const clientKey = `${endUrl}_${username}`;

        try {
            let client = activeSubscriptions.get(clientKey)?.client;
            let session;

            if (!client) {
                client = OPCUAClient.create({
                    securityMode: securityModeConstant,
                    securityPolicy: securityPolicyConstant,
                    certificateFile: "",
                    endpointMustExist: true
                });

                await client.connect(endUrl);

                session = username
                    ? await client.createSession({ userName: username, password: password })
                    : await client.createSession();

                activeSubscriptions.set(clientKey, {
                    client,
                    session,
                    subscriptions: new Map()
                });
            } else {
                session = activeSubscriptions.get(clientKey).session;
            }

            const subscriptionKey = "multi-node-subscription";
            let subscription = activeSubscriptions.get(clientKey)?.subscriptions.get(subscriptionKey);

            if (!subscription) {
                subscription = ClientSubscription.create(session, {
                    requestedPublishingInterval: frequency,
                    requestedLifetimeCount: 20,
                    requestedMaxKeepAliveCount: 10,
                    maxNotificationsPerPublish: 100,
                    publishingEnabled: true,
                    priority: 10
                });

                activeSubscriptions.get(clientKey).subscriptions.set(subscriptionKey, subscription);
            }

            const subscribedNodes = [];
            console.log(nodeIds, "nodeIds ")

            nodeIds.forEach(async (nodeId) => {
                try {
                    const monitoredItem = ClientMonitoredItem.create(
                        subscription,
                        { nodeId, attributeId: AttributeIds.Value },
                        { samplingInterval: frequency, discardOldest: true, queueSize: 10 }
                    );
                    const displayNameValue = await session.read({
                        nodeId,
                        attributeId: AttributeIds.DisplayName
                    });

                    monitoredItem.on("changed", (dataValue) => {
                        const tagUpdate = {
                            id: nodeId,
                            name: displayNameValue.value.value.text || nodeId, // No browsing, just use nodeId as name
                            value: dataValue.value.value,
                            status: dataValue.statusCode.name,
                            timestamp: new Date(),
                            dataType: DataType[dataValue.value.dataType]
                        };

                        wss2.clients.forEach((client) => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: tagUpdate.id,
                                    data: tagUpdate
                                }));
                                // console.log(tagUpdate.name,"->",tagUpdate.id, " ->", tagUpdate.value);
                            }
                        });
                    });

                    monitoredItem.on("err", (err) => {
                        console.error(`Error monitoring ${nodeId}:`, err);
                    });

                    subscribedNodes.push({ id: nodeId, name: nodeId });

                } catch (error) {
                    console.error(`Error creating monitored item for ${nodeId}:`, error);
                }
            });

            res.json({ status: "connected", nodes: subscribedNodes });

        } catch (error) {
            console.error("OPC UA Error:", error);
            res.status(500).json({ error: error.message });

            if (activeSubscriptions.has(clientKey)) {
                const { client, session } = activeSubscriptions.get(clientKey);
                await session?.close();
                await client?.disconnect();
                activeSubscriptions.delete(clientKey);
            }
        }
    });

    return RetentionTagsRoute;
};
