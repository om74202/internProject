module.exports = (wss) => {
    const express = require("express");
    const WebSocket = require("ws")
    const { OPCUAClient, AttributeIds, SecurityPolicy, MessageSecurityMode, ClientSubscription, ClientMonitoredItem , DataType , NodeClass} = require("node-opcua");

    const getNodesSubRoute = express.Router();
    const activeSubscriptions = new Map(); // Track active subscriptions by session

    // Cleanup when WebSocket clients disconnect
    wss.on("connection", (ws) => {
        ws.on("close", () => {
            // Cleanup logic if needed
        });
    });

    const isClientConnected = (client) => {
        return client && client._secureChannel !== null;
      };

    getNodesSubRoute.post("/", async (req, res) => {
        const { endUrl, nodeId, username, password, securityPolicy, securityMode , certificate , frequency=1000 } = req.body;
        
        // Security configuration
        const securityPolicyMap = {
            "basic256sha256": SecurityPolicy.Basic256Sha256,
            "basic128rsa15": SecurityPolicy.Basic128Rsa15,
            "basic256": SecurityPolicy.Basic256,
            "none": SecurityPolicy.None,
            "basic192": SecurityPolicy.Basic192,
            "basic192Rsa15": SecurityPolicy.Basic192Rsa15
        };
        
        const securityModeMap = {
            "none": MessageSecurityMode.None,
            "sign": MessageSecurityMode.Sign,
            "signandencrypt": MessageSecurityMode.SignAndEncrypt
        };

        const securityPolicyConstant = securityPolicyMap[securityPolicy?.toLowerCase()] || SecurityPolicy.None;
        const securityModeConstant = securityModeMap[securityMode?.toLowerCase()] || MessageSecurityMode.None;

        const clientKey = `${endUrl}_${username}`; // Unique key for client/session

        try {
            // Reuse existing client if available
            let client = activeSubscriptions.get(clientKey)?.client;
            let session;

            if (!client) {
                client = OPCUAClient.create({
                    securityMode: securityModeConstant,
                    securityPolicy: securityPolicyConstant,
                    certificateFile:"",
                    endpointMustExist: true
                });
                
                const response =await client.connect(endUrl);
            
                if(username!=="" ){
                    session = await client.createSession({ userName: username, password: password });
                }else{
                    session = await client.createSession();
                }
                
                // Store the client and session
                activeSubscriptions.set(clientKey, {
                    client,
                    session,
                    subscriptions: new Map()
                });
            } else {
                session = activeSubscriptions.get(clientKey).session;
            }

            const browseResult = await session.browse(nodeId || "RootFolder");
            const dataValue = await session.read({ nodeId, attributeId: AttributeIds.Value })
            const nodes = browseResult.references.map(ref => ({
                
                id: ref.nodeId.toString(),
                name: ref.displayName.text,
                valueMag: dataValue.value.value,
                status: dataValue.statusCode.name,
            }));

            if (session) {
                const subscriptionKey = nodeId || "RootFolder";
                let subscription = activeSubscriptions.get(clientKey)?.subscriptions.get(subscriptionKey);

                if (!subscription) {
                    subscription = ClientSubscription.create(session, {
                        requestedPublishingInterval: frequency,
                        requestedLifetimeCount: 20,
                        requestedMaxKeepAliveCount: 10,
                        maxNotificationsPerPublish: 10,
                        publishingEnabled: true,
                        priority: 10
                    });

                    activeSubscriptions.get(clientKey).subscriptions.set(subscriptionKey, subscription);

                    // Monitor each node
                    nodes.forEach(async node => {

                        try {
                            
                        const monitoredItem = ClientMonitoredItem.create(
                            subscription,
                            { nodeId: node.id, attributeId: AttributeIds.Value },
                            { samplingInterval: frequency, discardOldest: true, queueSize: 10 }
                        );
                        

                        monitoredItem.on("changed", dataValue => {
                            const tagUpdate = {
                                id: node.id,
                                name: node.name,
                                value: dataValue.value.value,
                                status: dataValue.statusCode.name,
                                timestamp: new Date(),
                                dataType:DataType[dataValue.value.dataType]
                            };
                            wss.clients.forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                        type: tagUpdate.id,
                                        data: tagUpdate
                                    }));
                                }
                            });
                        });
                        monitoredItem.on("err", err => {
                            console.error(`Error monitoring ${node.id}:`, err);
                        });
                    }catch (error) {
                        console.error(`Error fetching DataType for ${node.id}:`, error);
                    }
                    });
                }
            }
            
            res.json({status:"connected" ,  nodes });
        } catch (error) {
            console.error("OPC UA Error:", error);
            res.status(500).json({ error: error.message });
            
            // Cleanup on error
            if (activeSubscriptions.has(clientKey)) {
                const { client, session } = activeSubscriptions.get(clientKey);
                session?.close();
                client?.disconnect();
                activeSubscriptions.delete(clientKey);
            }
        }
    });

    return getNodesSubRoute;
};


