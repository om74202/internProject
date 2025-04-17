import React, { useState } from "react";
import axios from "axios";

const MQTTConfigurationForm = () => {
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
    <div className="h-auto mt-5 bg-white flex items-center justify-center">
      <form
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
      </form>
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
