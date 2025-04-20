const express = require('express');
const bodyParser = require('body-parser');
const {
  OPCUAClient,
  AttributeIds,
  MessageSecurityMode,
  StatusCodes,
  DataType,
  SecurityPolicy
} = require('node-opcua');

const opcua = require('node-opcua');
const fetchTagRoute = express.Router();
fetchTagRoute.use(bodyParser.json());

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

fetchTagRoute.post('/', async (req, res) => {
  const {
    variable,
    endurl,
    securityMode = "none",
    securityPolicy = "none",
    username,
    password
  } = req.body;

  try {
    const client = OPCUAClient.create({
      connectionStrategy: {
        maxRetry: 1,
        initialDelay: 1000,
        maxDelay: 5000
      },
      securityMode: securityModeMap[securityMode.toLowerCase()],
      securityPolicy: securityPolicyMap[securityPolicy.toLowerCase()],
      endpointMustExist: true
    });

    await client.connect(endurl);
    const session = await client.createSession(
      username ? { userName: username, password } : { type: "anonymous" }
    );

    const nodesToRead = [{
        nodeId: variable.nodeId,
        attributeId: AttributeIds.Value
      }];
      
      const readResult = await session.read(nodesToRead);
      const dataValue = readResult[0];
      
      const result = {
        name: variable.name,
        value: dataValue.value.value,
        status: dataValue.statusCode.isGood() ? "good" : "bad",
        dataType: DataType[dataValue.value.dataType] || `Unknown (${dataValue.value.dataType})`,
        timestamp: dataValue.sourceTimestamp || new Date(),
        statusCode: dataValue.statusCode.toString()
      };

    await session.close();
    await client.disconnect();
    console.log(result)

    res.json({ success: true, data: result });

  } catch (e) {
    console.error("Error fetching tag values:", e);
    return res.status(500).json({ success: false, error: e.message || "Unexpected error" });
  }
});

module.exports = fetchTagRoute;
