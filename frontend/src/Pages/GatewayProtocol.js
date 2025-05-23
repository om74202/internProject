import React, { useState , useEffect} from "react";
import axios from "axios";
import { GrGraphQl } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { ServerListCard } from "../components/serverCard";

const TabbedForms =  () => {
  const [activeTab, setActiveTab] = useState("opcua");
  const navigate= useNavigate();

  // OPCUA State Variables
  const [ip , setIp ] = useState("");
  const [port , setPort ] = useState("")
  const [endURL, setEndUrl] = useState(`opc.tcp://${ip}:${port}`);
  const [auth , setAuth] = useState('Anonymous')

  const [securityPolicy, setSecurityPolicy] = useState("None");
  const [securityMode, setSecurityMode] = useState("None");
  const [opcUsername, setOpcUsername] = useState("");
  const [opcPassword, setOpcPassword] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [opcName, setOpcName] = useState("UniqueName");
  const [connected,setConnected]=useState(false);
  const [opcuaServers , setOpcuaServers] = useState([]);
  const [count , setCount ] = useState(0)

  const getEndUrl = () => `opc.tcp://${ip}:${port}`;

  useEffect(()=>{
    setEndUrl(getEndUrl());
  },[ip, port])


  useEffect(() => {
      const fetchServers = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData`);
          setOpcuaServers(response.data.map((item) => item.name));
        } catch (error) {
          console.error("Error fetching tags:", error);
        }
      };
    
      fetchServers();
    }, [count]);

  const checkConnection=async()=>{
    try{
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getTagsSub`, {
        endUrl:getEndUrl(),
        nodeId:"RootFolder",
        securityPolicy:securityPolicy,
        securityMode:securityMode,
        username:opcUsername,
        password:opcPassword,
      });
      console.log(response.data);
      if(response.data.status==="connected"){
        setConnected(true);
        setSuccessMessage("Connected to OPCUA server successfully!")
      }
    }catch(e){
      console.log(e);
    }
  }

  // Modbus State Variables
  const [modbusIpAddress, setModbusIpAddress] = useState("");
  const [modbusPort, setModbusPort] = useState("/dev/ttyUSB0");
  const [modbusPortTcp, setModbusPortTcp] = useState("");
  const [slaveId, setSlaveId] = useState("");
  const [registerType, setRegisterType] = useState("tcpip");
  const [registerAddress, setRegisterAddress] = useState("");
  const [numRegisters, setNumRegisters] = useState("2");
  const [baudRate, setBaudRate] = useState("9600");
  const [parity, setParity] = useState("N");
  const [stopBits, setStopBits] = useState("1");
  const [byteSize, setByteSize] = useState("8");
  const [timeout, setTimeout] = useState("2 second");

  const [readAddress, setReadAddress] = useState("");
  const [readCount, setReadCount] = useState("");
  const [regType, setRegType] = useState("None");
  const [ethernetIpAddress, setEthernetIpAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setCount(prev=>prev+1);

    let payload = {};
    let apiUrl = "";

    const slaveIdList = slaveId
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "")
      .map((id) => Number(id));

    if (activeTab === "opcua") {
      apiUrl = `${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData`; // OPCUA-specific endpoint
      payload = {
        endurl:endURL,
        securityPolicy:securityPolicy,
        securityMode:securityMode,
        username:opcUsername,
        password:opcPassword,
        certificate:certificate,
        name:opcName
      };
    } else if (activeTab === "modbus") {
      apiUrl = `${process.env.REACT_APP_BASE_URL}/modbus`; // Modbus-specific endpoint
      payload = {
        modbusIpAddress,
        modbusPort,
        modbusPortTcp,
        // registerAddress,
        // numRegisters,
        regType,
        baudRate,
        parity,
        stopBits,
        byteSize,
        readAddress,
        readCount,
        timeout,
        slaveId: slaveIdList,
      };
    } else if (activeTab === "ethernet") {
      apiUrl = `${process.env.REACT_APP_BASE_URL}/ethernetip`; // EtherNet/IP-specific endpoint
      payload = { ethernetIpAddress };
    }

    try {
      const response = await axios.post(apiUrl, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log(`Response for ${activeTab}:`, response.data);
      setSuccessMessage(
        `Configuration for ${activeTab} submitted successfully!`
      );
    } catch (err) {
      alert("Please Provide a unique Name")
      console.error(`Error submitting ${activeTab} configuration:`, err);
      setError(
        `Failed to submit configuration for ${activeTab}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-white flex flex-col items-center  justify-center max-w-4xl">
      <div className=" bg-white   rounded-lg  w-full ">
        {/* Tabs */}
        <h1 className=" text-3xl pb-5 font-bold border-b mb-5 flex items-center justify-start gap-2">
          {" "}
          <GrGraphQl />Edge Connectivity 
        </h1>
        <div className=" flex justify-around mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "opcua" ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded-lg`}
            onClick={() => setActiveTab("opcua")}
          >
            OPCUA
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "modbus" ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded-lg`}
            onClick={() => setActiveTab("modbus")}
          >
            Modbus
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "ethernet"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded-lg`}
            onClick={() => setActiveTab("ethernet")}
          >
            EtherNet/IP
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* OPCUA Form */}
          {activeTab === "opcua" && (
            <div className="">
              <h2 className="text-md ">OPCUA Configuration</h2>
              <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
  <div className="grid grid-cols-2 gap-4">
    {/* IP Address */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
      <input
        type="text"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Enter IP"
        required
      />
    </div>

    {/* Port */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
      <input
        type="text"
        value={port}
        onChange={(e) => setPort(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Enter Port"
        required
      />
    </div>

    {/* Security Policy */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Security Policy</label>
      <select
        value={securityPolicy}
        onChange={(e) => setSecurityPolicy(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option>None</option>
        <option>Basic128Rsa15</option>
        <option>Basic256</option>
        <option>Basic256Sha256</option>
        <option>Aes128_Sha256_RsaOaep</option>
      </select>
    </div>

    {/* Security Mode */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Security Mode</label>
      <select
        value={securityMode}
        onChange={(e) => {
          const selectedMode = e.target.value;
          setSecurityMode(selectedMode);
          if (selectedMode === "None") setSecurityPolicy("None");
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        {securityPolicy === "None" ? (
          <option>None</option>
        ) : (
          <>
            <option>Sign</option>
            <option>Sign & Encrypt</option>
          </>
        )}
      </select>
    </div>

    {/* Authentication */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Authentication Settings</label>
      <select
        value={auth}
        onChange={(e) => setAuth(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option>Anonymous</option>
        <option>Username and Password</option>
        <option>Certificate</option>
      </select>
    </div>

    {/* Server Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Server Name</label>
      <input
        type="text"
        value={opcName}
        onChange={(e) => setOpcName(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        placeholder="Enter unique server name"
      />
    </div>

    {/* Username & Password Fields (Conditional) */}
    {auth === "Username and Password" && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={opcUsername}
            onChange={(e) => setOpcUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter Username"
            disabled={certificate !== null}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={opcPassword}
            onChange={(e) => setOpcPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter Password"
            disabled={certificate !== null}
          />
        </div>
      </>
    )}

    {/* Certificate Upload (Conditional) */}
    {auth === "Certificate" && (
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Certificate (.pem)</label>
        <input
          type="file"
          accept=".pem"
          onChange={(e) => setCertificate(e.target.files[0])}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          disabled={securityPolicy !== "None" || opcUsername !== "" || opcPassword !== ""}
        />
      </div>
    )}
  </div>

  {/* Connection Button */}
  <div className="text-right">
    <button
      type="button"
      onClick={checkConnection}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {connected ? "Connection Successful" : "Test Connection"}
    </button>
  </div>
</div>


               
            </div>
          )}

          {/* Modbus Form */}
          {activeTab === "modbus" && (
            <div>
              <h2 className="text-2xl mb-4">Modbus Configuration</h2>
              <div className="mb-4">
                <label className="font-bold">Modbus Type:</label>
                <div className="flex gap-4 mt-2">
                  <label>
                    <input
                      type="radio"
                      value="tcpip"
                      checked={registerType === "tcpip"}
                      onChange={() => setRegisterType("tcpip")}
                    />
                    Modbus TCP IP
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="rtu"
                      checked={registerType === "rtu"}
                      onChange={() => setRegisterType("rtu")}
                    />
                    Modbus RTU
                  </label>
                </div>
              </div>

              {registerType === "tcpip" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label>IP Address:</label>
                      <input
                        type="text"
                        value={modbusIpAddress}
                        onChange={(e) => setModbusIpAddress(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                        placeholder="Enter IP Address"
                      />
                    </div>
                    <div>
                      <label>Port:</label>
                      <input
                        type="text"
                        value={modbusPortTcp}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[0-9.]*$/.test(value)) {
                            setModbusPortTcp(value);
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Enter Port"
                      />
                    </div>
                  </div>
                </>
              )}

              {registerType === "rtu" && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label>Port:</label>
                    <select
                      value={modbusPort}
                      onChange={(e) => setModbusPort(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option>/dev/ttyUSB0</option>
                      <option>/dev/ttyUSB1</option>
                      <option>/dev/ttyUSB2</option>
                      <option>/dev/ttyUSB3</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Register Type:</label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>Coil</option>
                    <option>Discrete Input</option>
                    <option>Input Register</option>
                    <option>Holding Register</option>
                  </select>
                </div>
                <div>
                  <label>Baud Rate:</label>
                  <select
                    value={baudRate}
                    onChange={(e) => setBaudRate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>1200</option>
                    <option>2400</option>
                    <option>4800</option>
                    <option>9600</option>
                    <option>19200</option>
                    <option>38400</option>
                    <option>57600</option>
                    <option>115200</option>
                  </select>
                </div>
                <div>
                  <label>Parity:</label>
                  <select
                    value={parity}
                    onChange={(e) => setParity(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>O</option>
                    <option>E</option>
                    <option>N</option>
                  </select>
                </div>
                <div>
                  <label>Stop Bits:</label>
                  <select
                    value={stopBits}
                    onChange={(e) => setStopBits(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>0</option>
                    <option>1</option>
                  </select>
                </div>
                <div>
                  <label>Byte Size:</label>
                  <input
                    type="text"
                    value={byteSize}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9.]*$/.test(value)) {
                        setByteSize(value);
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter Byte Size"
                  />
                </div>
                <div>
                  <label>Read Address:</label>
                  <input
                    type="text"
                    value={readAddress}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9.]*$/.test(value)) {
                        setReadAddress(value);
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter Starting Register Address"
                  />
                </div>
                <div>
                  <label>Read Count:</label>
                  <input
                    type="text"
                    value={readCount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9.]*$/.test(value)) {
                        setReadCount(value);
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="No. of Register to Read"
                  />
                </div>
                <div>
                  <label>Timeout:</label>
                  <select
                    value={timeout}
                    onChange={(e) => setTimeout(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>1 second</option>
                    <option>2 second</option>
                    <option>5 second</option>
                  </select>
                </div>
              </div>

              <div className="mb-6 pt-3">
                <label className="block text-gray-700 font-medium mb-2">
                  Slave Id
                </label>
                <input
                  type="text"
                  value={slaveId}
                  onChange={(e) => 
					  setSlaveId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter Slave Id (e.g. 1 or 1,2,3)"
                  required
                />
                <small className="text-gray-500">
                  Enter a single Slave Id (e.g. 1) or multiple Slave Ids
                  separated by commas (e.g. 1,2,3).
                </small>
              </div>
            </div>
          )}

          {/* EtherNet/IP Form */}
          {activeTab === "ethernet" && (
            <div>
              <h2 className="text-2xl mb-4">EtherNet/IP Configuration</h2>
              <div className="mb-4">
                <label>IP Address:</label>
                <input
                  type="text"
                  value={ethernetIpAddress}
                  onChange={(e) => setEthernetIpAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  placeholder="Enter IP Address"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">

          


<button
            type="submit"
            className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg"
            disabled={!connected}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          
          </div>

          
          
        </form>

        {successMessage && (
          <p className="mt-4 text-green-500 font-bold">{successMessage}</p>
        )}
        {error && <p className="mt-4 text-red-500 font-bold">{error}</p>}
      </div><p className="text-md font-semibold text-gray-900 ">Server List</p>
      <div>
        {activeTab === "opcua" && opcuaServers.map((variable , index)=>{
              return(
                <ServerListCard  key={index} title={variable} />
              )
            })}
      </div>
    </div>
  );
};

export default TabbedForms;
