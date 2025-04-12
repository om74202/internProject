import React, { useState } from "react";
import axios from "axios";
import { GrGraphQl } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const TabbedForms =  () => {
  const [activeTab, setActiveTab] = useState("opcua");
  const navigate= useNavigate();

  // OPCUA State Variables
  const [endURL, setEndUrl] = useState("");
  const [securityPolicy, setSecurityPolicy] = useState("None");
  const [securityMode, setSecurityMode] = useState("None");
  const [opcUsername, setOpcUsername] = useState("");
  const [opcPassword, setOpcPassword] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [opcName, setOpcName] = useState("");
  const [connected,setConnected]=useState(false);

  const isAuthSelected = securityMode!=="None" || securityPolicy!=="None";
  const isCertSelected = certificate !== null;

  const checkConnection=async()=>{
    try{
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getTagsSub`, {
        endUrl: endURL,
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
      console.error(`Error submitting ${activeTab} configuration:`, err);
      setError(
        `Failed to submit configuration for ${activeTab}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-auto mt-5 bg-white flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        {/* Tabs */}
        <h1 className="text-3xl pb-5 font-bold border-b mb-5 flex items-center justify-start gap-2">
          {" "}
          <GrGraphQl />Connection Servers
        </h1>
        <div className="flex justify-around mb-6">
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
            <div>
              <h2 className="text-2xl mb-4">OPCUA Configuration</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>ENDURL:</label>
                  <input
                    type="text"
                    value={endURL}
                    onChange={(e) => setEndUrl(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    placeholder="Enter ENDURL to connect"
                  />
                </div>
                <div>
                  <label>Security Policy:</label>
                  <select
                    value={securityPolicy}
                    onChange={(e) => {
                      const selectedPolicy = e.target.value;
                      setSecurityPolicy(selectedPolicy);
                      if (selectedPolicy === "None") {
                        setSecurityMode("None");
                      } else {
                        setSecurityMode("Sign");
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>None</option>
                    <option>Basic128Rsa15</option>
                    <option>Basic256</option>
                    <option>Basic256Sha256</option>
                  </select>
                </div>
                <div>
                  <label>Security Mode:</label>
                  <select
                    value={securityMode}
                    onChange={(e) => setSecurityMode(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>None</option>
                    <option>Sign</option>
                    <option>Sign & Encrypt</option>
                  </select>
                </div>
                <div>
                  <label>Username:</label>
                  <input
                    type="text"
                    value={opcUsername}
                    onChange={(e) => setOpcUsername(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter your Username"
                    disabled={isCertSelected}
                  />
                </div>
                <div>
                  <label>Password:</label>
                  <input
                    type="password"
                    value={opcPassword}
                    onChange={(e) => setOpcPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter your Password"
                    disabled={isCertSelected}
                  />
                </div>
                <div>
                <label>Name of server:</label>
                  <input
                    type="text"
                    value={opcName}
                    onChange={(e) => setOpcName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter a unique name for the server"
                  />
                </div>
                <div>
                  <label>Certificate:</label>
                  <input
                    type="file"
                    accept=".pem"
                    onChange={(e) => setCertificate(e.target.files[0])}
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={isAuthSelected}
                  />
                </div>

                
              </div>
               <div >
               <button type="button" className=' mt-6
      text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium
       rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none
        dark:focus:ring-blue-800
      'onClick={checkConnection} >{connected ? "connected" : "connect"}</button>
               </div>

               <button onClick={()=>{navigate('/tags')}} type="button" className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4
                focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 max-w-md dark:bg-green-600 dark:hover:bg-green-700
                 dark:focus:ring-green-800"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tags" viewBox="0 0 16 16">
                   <path d="M3 2v4.586l7 7L14.586 9l-7-7zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586z"/>
                   <path d="M5.5 5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1z"/>
                 </svg>Browse Tags</button>
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
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          
          </div>

          
          
        </form>

        {successMessage && (
          <p className="mt-4 text-green-500 font-bold">{successMessage}</p>
        )}
        {error && <p className="mt-4 text-red-500 font-bold">{error}</p>}
      </div>
    </div>
  );
};

export default TabbedForms;
