import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import AutocompleteInput from "../components/AutoCompleteInput";
import { ListCard } from "../components/card";
import MultiSelectDropdown from "../components/multipleSelectDropdown";
import Label from "../components/label";
import TagTable from "../components/VariableTable";
import { useParams } from "react-router-dom";
import evaluateExpression from "../components/evalExpression";
import { useSearchParams } from 'react-router-dom';
import { useLeavePrevention } from "../components/UnsavedChanges";
const AddVariable=()=>{
  

  const [tag,setTag] = useState([]);

  //input field 
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef2 = useRef(null);
  

const [searchParams] = useSearchParams();
const freq = searchParams.get('freq'); // "1000"
  const [dataLoggingServers  , setDataLoggingServers] =useState()
  const {serverName}= useParams()
  const [serverData , setServerData] = useState()
  const [selectedTag , setSelectedTag] = useState("");
  const [variables, setVariables] = useState([]);
  const [expression, setExpression] = useState("");
  const [submitted , setSubmitted] = useState(false)
  // Expression list 
  const [showExpressionList , setShowExpressionList] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [UnsavedChanges , setUnsavedChanges] = useState(false);

  const validateRows = (rows) => {
    for (const row of rows) {
      if (row.value === undefined || Number.isNaN(row.value)) {
        alert(`Validation Error: Variable "${row.variableName}" has an invalid value.`);
        return false;
      }
      if (row.status && row.status.toLowerCase() === "bad") {
        alert(`Validation Error: Variable "${row.variableName}" has a bad status.`);
        return false;
      }
      return true;
    }
  };

  // input field 

  useEffect(() => {
    if (inputValue.trim()) {
      setFilteredSuggestions(
        tag.filter(suggestion =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase())
      ))
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, tag]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange2 = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };
  const onSelect=(value)=>{
    setNewRow(prev=>({...prev,tagName:value}))
  }

  const handleSuggestionClick = (suggestion) => {
    onSelect(suggestion);
    setInputValue(suggestion);
    setShowSuggestions(false);
    // if(setEmpty===true){
    //   setInputValue('');
    // }
  };
  


  // for error 
  const [error , setError] = useState(false);
  const wrapperRef = useRef(null);




  const [rows, setRows] = useState([]);
    const [newRow, setNewRow] = useState({
      value:'',
      expression:'',
      variableName:'',
      tagName: '',
      status: '',
      subscriptionRate: freq,
      dataType: '',
    });
    // const handleFetchTags=async()=>{
    //   rows.map((row,index)=>{
        
        
    //   })
    // }

  
      const fetchNodeId = async () => {
        const response =  await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/tags/${newRow.tagName}`);
        console.log(newRow.tagName)

          return {
            name: newRow.variableName,
            nodeId: response.data.nodeId
          };
        }
        useEffect(() => {
          const handleKeyDown = (e) => {
            if (e.key === 'Delete' && selectedRowIndex !== null) {
              setRows((prevRows) => prevRows.filter((_, index) => index !== selectedRowIndex));
              setSelectedRowIndex(null);
            }
          };
        
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
        }, [selectedRowIndex]);
        
     


  //Table functions 
  const handleInputChange = (e) => {
    setNewRow({ ...newRow, [e.target.name]: e.target.value });
  };

  const addRow = async() => {
    
    const { variableName, tagName, subscriptionRate, expression } = newRow;

  if (!variableName || !tagName) return alert("Variable name and Tag name are required");
  try{
    const nameNodeId=await fetchNodeId();
    console.log(nameNodeId)
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`);
    const endurl=response.data.endurl
    const securityMode=response.data.securityMode
    const securityPolicy = response.data.securityPolicy
    const username= response.data.username
    const password=response.data.password
    const response2=await axios.post(`${process.env.REACT_APP_BASE_URL}/fetchTag`,{
      variable:nameNodeId,
      endurl:endurl
      ,username:username,
      password:password,
      securityMode:securityMode,
      securityPolicy:securityPolicy,
    })
    const value =evaluateExpression(response2.data.data.value+expression)
    console.log(value)

    const newRowData = {
      value: value,   // Adjust based on the structure of response2.data
      variableName: variableName,
      tagName: tagName,
      status: response2.data.data.status, // Adjust based on the structure of response2.data
      subscriptionRate: subscriptionRate,
      dataType: response2.data.data.dataType,
      expression:expression,
      tagID:nameNodeId.nodeId
    };

    // Add the new row to the rows state
    setRows((prevRows) => [...prevRows, newRowData]);
    
  }catch(e){
    console.log(e)
  }finally{
    setInputValue('')
    setNewRow({
      value:'',
        variableName:'',
        expression:'',
      tagName: '',
      status: '',
      subscriptionRate: freq,
      dataType: '',
    });
  }
  
  };


  const saveVariables = async () => {
    if(!validateRows(rows)){
      return;
    }
    try {
      const promises = rows.map((row, index) => {
        return axios.post(`${process.env.REACT_APP_BASE_URL}/addVariable`, {
          name: row.variableName.trim(),
          nodeId: row.tagID,
          dataType: row.dataType,
          expression: row.expression,
          serverName: serverName,
          frequency: row.subscriptionRate,
          nodeName: row.tagName,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
      })
  
      const responses = await Promise.allSettled(promises);  // wait for all requests
      console.log(responses)
  
     
          alert("Variables saved successfully")
        
      
    
      setRows([]);
    } catch (e) {
      console.error(e);
      alert("Internal Server Error");
    }
  }
  


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/onlyVariable/${serverName}`);
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
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/unbinded/tags/${serverName}`);
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

  




 



  const handleVariableClick = (variable) =>{
    setExpression((prev)=>(prev+variable))
  }


    return (
      <div className="mt-0 pt-0">
        
        <div className=" min-w-screen mx-auto">
      <h2 className="text-xl font-bold ">Add Variables</h2>

      {/* Table */}
      <table className="min-w-full border border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
          <th className="border ">Variable Name</th>
            <th className="border ">Tag Name</th>
            <th className="border ">Tag ID</th>
            <th className="border ">Subscription Rate</th>
            <th className="border ">Scaling</th>
            <th className="border ">DataType</th>
            <th className="border ">Value</th>
            <th className="border ">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-3 text-gray-500">Click Add Rows to add Rows</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
              key={index}
              className={`hover:bg-gray-50 cursor-pointer ${selectedRowIndex === index ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedRowIndex(index)}
            >
                <td className="border ">{row.variableName}</td>
                <td className="border ">{row.tagName}</td>
                <td className="border ">{row.tagID}</td>
                <td className="border ">{row.subscriptionRate}</td>
                <td className="border ">{row.expression}</td>
                <td className="border ">{row.dataType}</td>
                <td className="border ">{row.value}</td>
                <td className="border ">{row.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Input Form */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-6 gap-4">
        
      <input
          name="variableName"
          placeholder="Variable Name"
          value={newRow.variableName}
          onChange={handleInputChange}
          className="border max-h-10 p-2 rounded"
        />
        <div>
        {/* <AutocompleteInput placeholder={"Tag Name"} value={newRow.tagName}    suggestions={tag} onSelect={(value) => setNewRow(prev => ({ ...prev, tagName: value }))} 
 /> */}
  <div className="autocomplete-wrapper" ref={wrapperRef2}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange2}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Select Tag"
        className="autocomplete-input  bg-slate-200 border rounded-lg h-9 border-gray-300  max-w-1/2"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion, index) => (
            <li 
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item mouse-pointer hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {showSuggestions && filteredSuggestions.length == 0 && (
        <ul className="suggestions-list">
          {tag.map((suggestion, index) => (
            <li 
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item mouse-pointer hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
        </div>

       
        <input
        type="number"
          name="subscriptionRate"
          placeholder="Subscription Rate"
          value={newRow.subscriptionRate}
          onChange={handleInputChange}
          className={`border max-h-10 p-2 rounded`}
        />
        <input
          name="expression"
          placeholder="Scaling"
          value={newRow.expression}
          onChange={handleInputChange}
          className="border max-h-10 p-2 rounded"
        />
        {/* <AutocompleteInput placeholder={"Scaling"}  onSelect={(value)=>setNewRow(prev=>({...prev , expression:value}))}/> */}
       
        <button
        onClick={addRow}
        className=" bg-blue-600 max-h-10 text-white px-1 w-20 py-2 rounded hover:bg-blue-700"
      >
        Add Row
      </button>
      <button
        onClick={saveVariables}
        className=" bg-blue-600 max-h-10 text-white px-2 py-2 rounded hover:bg-blue-700"
      >
        save Variables
      </button>
        
      </div>

      
      <div>
      
      </div>
      
    </div>
    {newRow.subscriptionRate<=500  && (<div className="text-red-400 flex justify-center ">Enter value more than 500</div>)}

      
    <div className="flex flex-col">
      <div className="flex justify-center font-semibold">Saved Variables</div>
      <div className="">{variables.map((variable , index)=>{
      return(
        <ListCard  key={index}  title={variable} serverName={serverName}/>
      )
    })}
    </div>
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