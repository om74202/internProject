import React, { useEffect, useState } from 'react';
import './App.css';
import './input.css';
import Drawer from './Pages/Home/Drawer/drawer';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [defaultEthIP, setDefaultEthIP] = useState(null);



  return (
    <div className="App">
      <Drawer />
    </div>
  );
}

export default App;