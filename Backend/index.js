const express = require('express');
const {exec} =require("child_process");
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

const app = express();
app.use(express.json());
const wss = new WebSocket.Server({ noServer: true });
const router=express.Router();
app.use(cors());



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

app.use("/isConnected/",connectOpcuaRoute);
app.use("/getTagsSub", getNodesSubRoute(wss));

app.use("/modbus",modbusConfigRoute);
// adding more opcua and ethernet


// Add Variable
app.use("/addVariable" , toMysqlRoute);
app.use("/logdata", loggingtoInfluxRoute);
app.use("/logdataCloud" , loggingtoCloudRoute)

// Admin Config

app.use("/updateCredentials",updateCredentialsRoute);
app.use("/shutdown",actionShutdownRoute);
app.use("/reboot",rebootRoute);

//wifi config

app.use("/getWiFiNetworks",getWiFiNetworksRoute);
app.use("/connectWiFi",connectWiFiRoute);
app.use("/getCurrentSSID",getCurrtenWiFiSSIDRoute);

















const port = 3001;
const server =app.listen(port, () => console.log(`Server running on ${port} `));


server.on("upgrade", (req, socket, head) => {
    if (req.url === "/getTagsSub") {  // Match WebSocket path
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
    } else {
        socket.destroy();  // Reject other upgrades
    }
});