import React, { useEffect, useState } from 'react';
import './App.css';
import './input.css';
import Drawer from './Pages/Home/Drawer/drawer';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [defaultEthIP, setDefaultEthIP] = useState(null);

  // useEffect(() => {
  //   // Fetch the default Ethernet IP on component mount
  //   const fetchDefaultGatewayIP = () => {
  //     fetch('http://10.42.0.2:9600/getIPDefaultEth0')
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error("Error fetching Default Ethernet IP");
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  //         if (data.ip) {
  //           setDefaultEthIP(data.ip); // Set the default Ethernet IP in state
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching Default Ethernet IP:', error);
  //       });
  //   };

  //   fetchDefaultGatewayIP();
  // }, []);

  // // Redirect once the default gateway IP is fetched
  // useEffect(() => {
  //   if (defaultEthIP) {
  //     window.location.href = `http://${defaultEthIP}`; // Assuming your app runs on port 3000
  //   }
  // }, [defaultEthIP]);

  return (
    <div className="App">
      <Drawer />
    </div>
  );
}

export default App;