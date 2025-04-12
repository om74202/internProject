import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import AutocompleteInput from "../components/AutoCompleteInput";
import { ListCard } from "../components/card";
// import influxPool from "../../../Backend/db/influxPool";
const AddVariable=()=>{
  

  const [tag,setTag] = useState([]);
  const [serverNames , setServerNames] = useState([]);
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
        const response = await axios.get("http://localhost:3001/addVariable/opcuaData");
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
        const response = await axios.get("http://localhost:3001/addVariable");
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
        const response = await axios.get("http://localhost:3001/addVariable/tags");
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
      const tagInfo = await axios.get('http://localhost:3001/addVariable/tags/' + selectedTag);
      const dataType = tagInfo.data[0][0].dataType;
      const nodeId = tagInfo.data[0][0].nodeId
      console.log(nodeId, dataType)
      const response = await axios.post('http://localhost:3001/addVariable',{
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

  const handleDataLog = async ()=>{
    try{
      const newSocket = new WebSocket("ws://localhost:3001/getTagsSub");

      newSocket.onopen = () => {
        console.log("✅ WebSocket connected");
      };
  
      newSocket.onmessage =  async (event) => {
        const message = JSON.parse(event.data);
       const nodeId = message.type;
       const value = message.data.value;
       const response = await axios.post("http://localhost:3001/logData", {
        nodeId: nodeId,
        value: value,
       })
       console.log("data logged ",response.data);
        
      };
  
      newSocket.onclose = () => {
        console.log("❌ WebSocket disconnected");
      };
  
      setSocket(newSocket);

    }catch(e){
      console.log(e);
    }
  }



  const handleCloudDataLog = async ()=>{
    try{
      const newSocket = new WebSocket("ws://localhost:3001/getTagsSub");

      newSocket.onopen = () => {
        console.log("✅ WebSocket connected");
      };
  
      newSocket.onmessage =  async (event) => {
        const message = JSON.parse(event.data);
       const nodeId = message.type;
       const value = message.data.value;
       const response = await axios.post("http://localhost:3001/logDataCloud", {
        nodeId: nodeId,
        value: value,
       })
       console.log("data logged ",response.data);
        
      };
  
      newSocket.onclose = () => {
        console.log("❌ WebSocket disconnected");
      };
  
      setSocket(newSocket);

    }catch(e){
      console.log(e);
    }
  }

    return (
      <div>
      <div ref={wrapperRef} className="p-6 w-1/2 mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-center">Tag & Variable Form</h2>
      
      {/* Tag Dropdown */}
      <div className="relative">

        <AutocompleteInput suggestions={serverNames} onSelect={(value)=>{setSelectedServerName(value)}}/>

      </div>
      
      <div className="relative">

        <AutocompleteInput suggestions={tag} onSelect={(value)=>{setSelectedTag(value)}}/>

      </div>


      
      {/* Variable Dropdown */}
      
      <div className="relative">
        <input
          type="text"
          placeholder="Enter the Name of the Variable"
          value={variableSearchTerm}
          onChange={handleVariableSearch}
          className="autocomplete-input bg-slate-200 border rounded-lg h-9 border-gray-300  w-full "
        />

        
      </div>

      {error && <span className="font-bold text-red-600">Please assign a unique  name to Tag </span>}
      
      
      
      {/* Expression Input */}
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

      

      
      {/* Submit Button */}
      <button 
        onClick={handleSubmit} 
        className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Submit
      </button>
      <button 
      onClick={handleDataLog}
    className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
  >
    logData
  </button>
  <button 
  onClick={handleCloudDataLog}
    className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
  >
    logData to cloud
  </button>
    </div>
    {variables.map((variable , index)=>{
      return(
        <ListCard  key={index} title={variable}/>
      )
    })}
    </div>
    
      )
}

export default AddVariable;