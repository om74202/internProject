import React, { useEffect, useState } from 'react';
import './App.css';
import './input.css';
import Drawer from './Pages/Home/Drawer/drawer';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

function App() {
  const [defaultEthIP, setDefaultEthIP] = useState(null);
  const [dataLoggingServers,setDataLoggingServers]=useState([]);

  useEffect(()=>{
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData`);
        setDataLoggingServers(
          response.data.filter(item => item.status === "connected").map(item => item.name)
        );
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
  
    fetchTags();
  },[])

  useEffect(()=>{
    const startReplication=async()=>{
      try{
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/replication`)
        console.log(response.data)
      }catch(e){
        alert("Replication Failed")
      }
    }
  
    
    // Influx LOgging Page 
  
  
  const handleDataLog = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/startDataLog`, {
        servers: dataLoggingServers
      });
      console.log(response.data); // log any status or results
    } catch (e) {
      console.error('Error starting data log:', e);
    }
  };

    if(dataLoggingServers.length>0){
      handleDataLog()
      startReplication()
    }
  
  },[dataLoggingServers])



  return (
    <div className="App">
      <Drawer />
    </div>
  );
}

export default App;