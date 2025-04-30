const express = require('express');
const http = require('http')
const cors=require("cors");
const WebSocket = require("ws")
const getDefaultEthernetIPRoute = require('./Routes/networkStatus/getDefaultEthernetIp');
const getEthernetIpRoute = require('./Routes/networkStatus/getEthernetIp');
const getWiFiIpRoute = require('./Routes/networkStatus/getWiFiIp');
const getTempRoute = require('./Routes/HealthMonitoring/getTemp');
const getCPURoute = require('./Routes/HealthMonitoring/getCPU');
const getMemoryRoute = require('./Routes/HealthMonitoring/getMemory');
const getDiskRoute=require('./Routes/HealthMonitoring/getDisk');
const getMacEthernetIDRoute = require('./Routes/getMacEthernetID');
const getMacWlanIDRoute = require('./Routes/getMacWlanID');
const getWiFiRoute = require('./Routes/IPConfig/getWiFiStatic');
const getEthernetInfoRoute = require('./Routes/IPConfig/getEthernetInfo');
const changeEthernetProfileRouter = require('./Routes/IPConfig/changeEthernetProfile');
const getPortsRoute = require('./Routes/PortConfig/getPorts');
const addPortRoute = require('./Routes/PortConfig/addPort');
const deletePortRoute = require('./Routes/PortConfig/deletePort');
const postMqttConfigRoute = require('./Routes/MqttConfig/postMqttConfig');
const modbusConfigRoute = require('./Routes/GatewayProtocols/postModbusConfig');
const updateCredentialsRoute = require('./Routes/AdminConfig/updateCredentials');
const actionShutdownRoute = require('./Routes/AdminConfig/actionShutdown');
const rebootRoute = require('./Routes/AdminConfig/Reboot');
const opcuaConfigRoute = require('./Routes/GatewayProtocols/postOpcuaConfig');
const connectOpcuaRoute = require('./Routes/GatewayProtocols/connectOpcua');
const getWiFiNetworksRoute = require('./Routes/WiFiConfig/getWiFiNetworks');
const connectWiFiRoute = require('./Routes/WiFiConfig/connectWiFi');
const getCurrtenWiFiSSIDRoute = require('./Routes/WiFiConfig/getCurrentWiFiSSID');
const getNodesSubRoute = require('./Routes/GatewayProtocols/getTagsSub');
const toMysqlRoute = require('./Routes/AddVariable/toMysql');
const loggingtoInfluxRoute = require('./Routes/logData/loggingtoInflux');
const loggingtoCloudRoute = require('./Routes/logData/loggingtoCloud');
const RetentionTagsRoute = require('./Routes/GatewayProtocols/getTagsSub2');
const setupWebSocket = require('./Routes/GatewayProtocols/websocket');
const updatesEmitter = require('./Routes/updatesEmitter');
const fetchTagRoute = require('./Routes/GatewayProtocols/fetchTags');
const toMysqlRoute2 = require('./Routes/AddVariable/toMysql2');
const toMysqlFormulaRoute = require('./Routes/AddVariable/toMysqlFormuls');
const getVariable3 = require('./Routes/GatewayProtocols/getVariablesSub3');
const ReplicationRouter = require('./Routes/logData/StartReplication');


const app = express();
const server = http.createServer(app);
app.use(express.json());
// const wss = new WebSocket.Server({ noServer: true });
app.use(cors());


const wss1 = new WebSocket.Server({ noServer: true });
const wss = new WebSocket.Server({ noServer: true });
const wss2= new WebSocket.Server({noServer:true})




app.use("/getDEIp",getDefaultEthernetIPRoute);
app.use("/getEIp",getEthernetIpRoute);
app.use("/getWiFiIp",getWiFiIpRoute);
// Health Monitoring
app.use("/temperature",getTempRoute);
app.use("/cpu",getCPURoute);
app.use("/memory",getMemoryRoute);
app.use("/disk",getDiskRoute);
// Network 
app.use("/getIPDefaultEth0",getDefaultEthernetIPRoute);
app.use("/getIPWlan0",getWiFiIpRoute);
app.use("/getIPEth0",getEthernetIpRoute);
app.use("/getEthMacID",getMacEthernetIDRoute);
app.use("/getWlanMacID",getMacWlanIDRoute);
// ip config

app.use("/getWifiStatic",getWiFiRoute);
app.use("/getEthStatic",getEthernetInfoRoute);
app.use("/editEthernetProfile",changeEthernetProfileRouter);


// Port config


app.use("/getFirewallPorts",getPortsRoute);
app.use("/addPort",addPortRoute);
app.use("/deletePort",deletePortRoute);

// Mqtt config
app.use("/mqtt-connection",postMqttConfigRoute);

// Gateway Protocol
app.use("/getTagsSub", getNodesSubRoute(wss));
app.use("/RetentionTags" , RetentionTagsRoute(wss2))
app.use("/fetchTag" , fetchTagRoute);

app.use("/modbus",modbusConfigRoute);
// adding more opcua and ethernet


// Add Variable
app.use("/addVariable" , toMysqlRoute);
app.use("/addFormula",toMysqlFormulaRoute);
app.use("/logdata", loggingtoInfluxRoute);
app.use("/logdataCloud" , loggingtoCloudRoute)
app.use("/" , ReplicationRouter)

// app.use("/" , getVariable2);
app.use('/', getVariable3);
// setupWebSocket(server);

// Admin Config

app.use("/updateCredentials",updateCredentialsRoute);
app.use("/shutdown",actionShutdownRoute);
app.use("/reboot",rebootRoute);

//wifi config

app.use("/getWiFiNetworks",getWiFiNetworksRoute);
app.use("/connectWiFi",connectWiFiRoute);
app.use("/getCurrentSSID",getCurrtenWiFiSSIDRoute);
















// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 HTTP server running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server listening at ws://localhost:${PORT}`);
});


server.on("upgrade", (req, socket, head) => {
    if (req.url === "/getTagsSub" ) {  // Match WebSocket path
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
    }else if(req.url==="/RetentionTags"){
        wss2.handleUpgrade(req, socket, head, (ws) => {
            wss2.emit("connection", ws, req);
        });

    }else if (req.url==="/"){
        wss1.handleUpgrade(req, socket , head , (ws) =>{
            wss1.emit("connection" , ws , req)
        })
    } else {
        socket.destroy();  // Reject other upgrades
    }
});



setupWebSocket(wss1);