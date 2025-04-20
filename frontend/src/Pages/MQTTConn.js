import React, { useEffect, useState } from "react";
import axios from "axios";
import MultiSelectDropdown from "../components/multipleSelectDropdown";


const MQTTConfigurationForm = () => {
  const [activeTab , setActiveTab] = useState("Influx Logging")
  const [dataLoggingServers , setDataLoggingServers] = useState([])
  const [serverNames , setServerNames] = useState([]);
  const [formulas, setFormulas] = useState([]);


  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData`);
        setServerNames(response.data.map((item) => item.name));
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
  
    fetchTags();
  }, []);

  const startReplication=async()=>{
    try{
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/replication`)
      console.log(response.data)
    }catch(e){
      alert("Replication Failed")
    }
  }

  const handledropdown = (selectedOptions) => {
    setDataLoggingServers(selectedOptions)
  };
  // Influx LOgging Page 
  const handleDataLog = async ()=>{

    dataLoggingServers.forEach(async (serverName)=>{
      try{
      const serverData = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`)
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/onlyVariable/${serverName}`);
    const variableNameValue = response.data.map(item => ({
      name: item.name,
      nodeId: item.nodeId
      ,expression:item.expression
      ,frequency:item.frequency
    }));
    const response2 = await axios.post(`${process.env.REACT_APP_BASE_URL}/subscribeVariables` , {variables:variableNameValue
      , endurl: serverData.data.endurl
      , username : serverData.data.username , 
      password : serverData.data.password ,
      securePolicy : serverData.data.securityPolicy ,
      securityMode : serverData.data.securityMode ,
       certificate: serverData.data.certificate
    })
    const responseFormulas = await axios.get(`${process.env.REACT_APP_BASE_URL}/addFormula/onlyFormula/${serverName}`);

setFormulas(responseFormulas.data.map((item) => ({
  name: item.name,
  expression: item.expression,
  serverName: item.serverName
})));


        const response3 = await axios.post(`${process.env.REACT_APP_BASE_URL}/formulaLog` , {
          formulas:responseFormulas.data
        })

    const wss=new WebSocket("ws://localhost:3001");
    
  }catch(e){
      console.log(e);
    }
    })
  }



  const handleCloudDataLog = async ()=>{
    try{

      const socket = new WebSocket('ws://localhost:3001'); // adjust the port

socket.onopen = () => {
  console.log('Connected to cloud logging WebSocket');
};

socket.onmessage = async(event) => {
  try {
    const update = JSON.parse(event.data); 
    const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/logdataCloud`,{
      name:update.name,
      value:update.value,
      expression:update.expression
    })

    

    // Send to cloud InfluxDB
    

  } catch (err) {
    console.error('Invalid JSON from WebSocket:', event.data);
  }
};

socket.onclose = () => {
  console.log('Disconnected from backend WebSocket');
};


    }catch(e){
      console.log(e);
    }
  }








  // Separate state variables for each input field

  const [brokerAddress, setBrokerAddress] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [topic, setTopic] = useState("");
  const [qos, setQos] = useState("2");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      brokerAddress,
      port,
      username,
      password,
      topic,
      qos,
    };


    try {
      const response = await axios.post(
        // Enter API Connection URL 🔽
        `${process.env.REACT_APP_BASE_URL}/mqtt-connection`,
        payload
      );
      alert("Configuration submitted successfully!");
      console.log(response.data);
    } catch (error) {
      console.error("Error submitting the configuration:", error);
      alert("Failed to submit the configuration.");
    }
  };

  return (
    <div className="h-auto mt-5 bg-white flex flex-col items-center justify-center">
      <div className="">
      <button
            className={`px-4 mx-7 py-2 font-medium ${
              activeTab === "Influx Logging" ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded-lg`}
            onClick={() => setActiveTab("Influx Logging")}
          >
            Opsight Gateway
          </button>
          <button
            className={`px-4 mx-7 py-2 font-medium ${
              activeTab === "Mqtt" ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded-lg`}
            onClick={() => setActiveTab("Mqtt")}
          >
            MQTT 
          </button>
          <button
            className={`px-4 mx-7 py-2 font-medium ${
              activeTab === "API" ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded-lg`}
            onClick={() => setActiveTab("API")}
          >
            API
          </button>
      </div>
     <div>
      {activeTab==="Influx Logging" && (
        <div className="bg-white shadow-lg rounded-2xl mb-6 p-6 w-full max-w-lg space-y-4">
        <label className="block text-gray-600 text-lg font-medium">
          Select Servers for Data Logging
        </label>
        
        <MultiSelectDropdown options={serverNames} onChange={handledropdown} />
      
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button 
            onClick={handleDataLog}
            className="flex-1 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Log Data
          </button>
          <button 
            onClick={startReplication}
            className="flex-1 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Start Replication
          </button>
        </div>
        <button 
            className="flex-1 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Stop DataLogging
          </button>
      </div>
      
      )}
     {activeTab==="Mqtt" && (<form
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 p-3">MQTT Connection</h2>

        <div className="flex items-center justify-center gap-3">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Broker Address
            </label>
            <input
              type="text"
              value={brokerAddress}
              onChange={(e) => setBrokerAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter broker address"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter port number"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 w-full mt-3">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter username"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter password"
            />
          </div>
        </div>

        <div className="mb-4 p-3">
          <label className="block text-gray-700 font-medium mb-2">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter topic"
            required
          />
        </div>

        <div className="mb-6 p-3">
          <label className="block text-gray-700 font-medium mb-2 max-w-full">
            QoS
          </label>
          <select
            value={qos}
            onChange={(e) => setQos(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>

       

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Submit Configuration
        </button>
      </form>)}
     </div>
    </div>
  );
};

export default MQTTConfigurationForm;



{/* <div>
      <label  className="text-gray-500" > Select Servers for Data logging</label>
      <MultiSelectDropdown options={serverNames} onChange={handledropdown} />
      <button 
      onClick={handleDataLog}
    className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
  >
    logData
  </button>
  <button 
  onClick={handleCloudDataLog}
    className="w-full p-2 my-5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
  >
    logData to cloud
  </button>
      </div> */}
