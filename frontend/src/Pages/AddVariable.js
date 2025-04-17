import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import AutocompleteInput from "../components/AutoCompleteInput";
import { ListCard } from "../components/card";
import { secureHeaders } from "hono/secure-headers";
import MultiSelectDropdown from "../components/multipleSelectDropdown";
import Label from "../components/label";
import TagTable from "../components/VariableTable";
const AddVariable=()=>{
  

  const [tag,setTag] = useState([]);
  const [serverNames , setServerNames] = useState([]);
  const [dataLoggingServers  , setDataLoggingServers] =useState(serverNames)
  const [selectedServerName , setSelectedServerName] = useState("")
  const [selectedTag , setSelectedTag] = useState("");
  const [variables, setVariables] = useState([]);
  const [variableSearchTerm , setVariableSearchTerm] = useState("")
  const [selectedVariable , setSelectedVariable] = useState("");
  const [expression, setExpression] = useState("");
  const [socket , setSocket] = useState(null);
  const [submitted , setSubmitted] = useState(false);
  // Expression list 
  const [showExpressionList , setShowExpressionList] = useState(false);
  const [filteredVariables , setFilteredVariables] = useState([]);
  const [expressionVariable , setExpressionVariable] = useState("");

  // for error 
  const [error , setError] = useState(false);
  const wrapperRef = useRef(null);

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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable`);
        setVariables(response.data.map((item) => item.name));
      } catch (error) {
        console.error("Error fetching variables:", error);
      }
    };
  
    fetchData();
  }, [submitted]);
  
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/tags`);
        setTag(response.data.map((item) => item.name));
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
  
    fetchTags();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowExpressionList(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  




 


  const handleVariableSearch = (e) => {
    const value = e.target.value;
    setVariableSearchTerm(value);
    setError(false);
    setSelectedVariable(value)
  };

  const handleVariableClick = (variable) =>{
    setExpression((prev)=>(prev+variable))
  }


  const handleSubmit = async () => {
    try{
      const tagInfo = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/tags/${selectedTag}`);
      const dataType = tagInfo.data[0][0].dataType;
      const nodeId = tagInfo.data[0][0].nodeId
      console.log(nodeId, dataType)
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/addVariable`,{
      name: selectedVariable,
      tag: selectedTag,
      nodeId:nodeId,
      serverName:selectedServerName,
      expression: expression,
      dataType: dataType,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " ")
    }) 
    console.log("sucess->",response.data)
    setSubmitted(true);
    return response.data;
  }catch(e){
    setError(true);
    console.log(e);
  }   
  };



  // Real time data logging logic to cloud and r pi using variableSub2.js
  const handleDataLog = async ()=>{

    dataLoggingServers.forEach(async (serverName)=>{
      try{
      const serverData = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`)
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/onlyVariable/${serverName}`);
    const variableNameValue = response.data.map(item => ({
      name: item.name,
      nodeId: item.nodeId
      ,expression:item.expression
    }));
    const response2 = await axios.post(`${process.env.REACT_APP_BASE_URL}/subscribe` , {variables:variableNameValue
      , endurl: serverData.data.endurl
      , username : serverData.data.username , 
      password : serverData.data.password ,
      securePolicy : serverData.data.securityPolicy ,
      securityMode : serverData.data.securityMode ,
       certificate: serverData.data.certificate
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

  const handledropdown = (selectedOptions) => {
    console.log("Selected:", selectedOptions);
    setDataLoggingServers(selectedOptions)
  };

    return (
      <div className="">
        <div>
          <TagTable/>
        </div>
      
    <div className="w-full">{variables.map((variable , index)=>{
      return(
        <ListCard  key={index} title={variable}/>
      )
    })}
    </div>
    </div>
    
      )
}

export default AddVariable;







{/* <div ref={wrapperRef} className="p-6 w-full mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-center">Tag & Variable Form</h2>
      <div className="relative">
        <label  className="text-gray-500" > Select Server</label>

        <AutocompleteInput suggestions={serverNames} onSelect={(value)=>{setSelectedServerName(value)}}/>

      </div>
      
      <div className="relative">
      <label  className="text-gray-500" > Select Tag</label>

        <AutocompleteInput suggestions={tag} onSelect={(value)=>{setSelectedTag(value)}}/>

      </div>


      
  
      
      <div className="relative">
      <label  className="text-gray-500" > Variable's name</label>
        <input
          type="text"
          placeholder="Enter the Name of the Variable"
          value={variableSearchTerm}
          onChange={handleVariableSearch}
          className="autocomplete-input bg-slate-200 border rounded-lg h-9 border-gray-300  w-full "
        />

        
      </div>

      {error && <span className="font-bold text-red-600">Please assign a unique  name to Tag </span>}
      <div className="flex flex-col">
      <input
        type="text"
        placeholder="Enter an expression"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        onFocus={()=>setShowExpressionList(true)}
        className="w-full p-2  bg-slate-200 border rounded-lg h-14"
      /> 

{showExpressionList  && (
        <ul className="suggestions-list">
          {variables.map((variable, index) => (
            <li 
              key={index}
              onClick={()=>handleVariableClick(variable)}

              className="suggestion-item mouse-pointer hover:bg-gray-200"
            >
              {variable}
            </li>
          ))}
        </ul>
      )}
           

      </div>

      

      
   
      <button 
        onClick={handleSubmit} 
        className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Submit
      </button>

      
    </div> */}