// const express = require("express");
// const { OPCUAClient, AttributeIds, SecurityPolicy, MessageSecurityMode, ClientSubscription, ClientMonitoredItem , DataType} = require("node-opcua");


// const connectOpcuaRoute = express.Router();

// connectOpcuaRoute.post('/', async (req, res) => {
    
//   const { endUrl, nodeId, username, password, securityPolicy, securityMode } = req.body;
        
//   // Security configuration
//   const securityPolicyMap = {
//       "basic256sha256": SecurityPolicy.Basic256Sha256,
//       "basic128rsa15": SecurityPolicy.Basic128Rsa15,
//       "basic256": SecurityPolicy.Basic256,
//       "none": SecurityPolicy.None,
//       "basic192": SecurityPolicy.Basic192,
//       "basic192Rsa15": SecurityPolicy.Basic192Rsa15
//   };
  
//   const securityModeMap = {
//       "none": MessageSecurityMode.None,
//       "sign": MessageSecurityMode.Sign,
//       "signandencrypt": MessageSecurityMode.SignAndEncrypt
//   };

//   const securityPolicyConstant = securityPolicyMap[securityPolicy?.toLowerCase()] || SecurityPolicy.None;
//   const securityModeConstant = securityModeMap[securityMode?.toLowerCase()] || MessageSecurityMode.None;

//   const clientKey = `${endUrl}_${username}`; // Unique key for client/session

//   try {
//       // Reuse existing client if available
      
//       }catch(e){
//         console.log(e);
//         res.status(500).json({error : "failed to connect to opcua server"})
//       }
//     }

// );

// module.exports = connectOpcuaRoute;