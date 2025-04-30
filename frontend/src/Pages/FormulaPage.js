import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AutocompleteInput from '../components/AutoCompleteInput';
import { ListCardFormula } from '../components/FormulaCard';
import { TrophyOutlined } from '@ant-design/icons';


const FormulaBuilder = () => {
  // Available variables from your system
  const [variables, setVariables] = useState([]);
  const [name , setName]=useState('');
  const [dataType , setDataType] =useState('')
  const {serverName} = useParams();
  const [frequency , setFrequency] = useState('')
  const [formulas , setFormulas] = useState([]);
  const [checkMessage , setCheckMessage] = useState(null)
  const [enableSave , setEnableSave] = useState(false);
  const [params , setParams]=useState([]);

  // User's formula input
  const [formula, setFormula] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addFormula/onlyFormula/${serverName}`);
        setFormulas(response.data.map((item) => item.name));
      } catch (error) {
        console.error("Error fetching variables:", error);
      }
    };



  
    fetchData();
  }, []);

  

    const getFormulaInfo= async()=>{
      const variableNames = [...new Set(
        formula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || []
      )];
    
      let evaluatedFormula = formula; // copy formula to work on it
      console.log(variableNames)
    
      if (variableNames.length > 0) {
        // Fetch common server details once
        const { data: serverData } = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`);
        const { endurl, securityMode, securityPolicy, username, password } = serverData;
    
        try{for (const variable of variableNames) {
          try {
            const { data: variableData } = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/${variable}`);
            const { name, nodeId } = variableData;
    
            const { data: tagData } = await axios.post(`${process.env.REACT_APP_BASE_URL}/fetchTag`, {
              variable: { name, nodeId },
              endurl,
              securityMode,
              securityPolicy,
              username,
              password,
            });
    let value;console.log("fetched result is ", tagData.data)
            if(tagData.data.value){
              value = tagData.data.value;
            }else{
              value = 0;
            }
    
            // Safely replace only the exact variable name in formula
            const regex = new RegExp(`\\b${variable}\\b`, 'g');
            evaluatedFormula = evaluatedFormula.replace(regex, value);
            console.log("Evaluated Formula is ",evaluatedFormula,value)
            

          }catch(e){
            console.log(e)
          }
          
        
        }}catch(e){
          setCheckMessage("Please check the formula and try again")
        }
        const result =eval(evaluatedFormula);
        setCheckMessage(`The calculated value is ${result}`);
        setEnableSave(true)
        setParams(variableNames);

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
  }, []);

  const handleSave=async()=>{
    try{
        const response =await axios.post(`${process.env.REACT_APP_BASE_URL}/addFormula`,{
            name:name,
            expression:formula,
            serverName:serverName,
            dataType:dataType,
            createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            frequency:frequency
        })

        try{params.forEach(async(param)=>{
          const response=await axios.put(`${process.env.REACT_APP_BASE_URL}/addVariable/setFormulaStatus/${param}`,{formula:name})
        })}catch(e){
          alert("Please Check the variables name");
        }

        alert("variable saved Succesfully")
    }catch(e){
        alert("Please enter a unique name")
    }
  }

  

  return (
    <div className=" max-w-5xl ">
      <h1 className="text-2xl font-bold ">Custom Formula </h1>
      
      <div className="">

      <div className="flex flex-row justify-evenly ">
        <div>
        <label className="block text-sm font-medium mb-1">
          Enter your formula:
        </label>
        <textarea
            value={formula}
            onChange={(e)=>{setFormula(e.target.value)}}
            className="w-3xl p-3 border rounded-md h-20 font-mono"
            placeholder="E.g.: ($temperature * 1.8) + 32"
          />
        </div>
              <div>
              <label className="block text-gray-700">Variable Name</label>
              <input
              value={name}
              onChange={(e)=>{setName(e.target.value)}}
              
                type="text"
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter a unique Name"
              />
              </div>
               <div>
               <label className="block text-gray-700">DataType</label>
               <select
  value={dataType}
  onChange={(e) => setDataType(e.target.value)}
  className="w-full px-4 py-2 border rounded-md mt-2"
>
  <option value="">Select Data Type</option>
  <option value="int">Integer (int)</option>
  <option value="float">Float</option>
  <option value="string">String</option>
  <option value="boolean">Boolean</option>
  <option value="datetime">DateTime</option>
</select>
               </div>
               <div>
               <label className="block text-gray-700 ">Frequency</label>
               <div className="flex justify-end">
  <input
    list="frequency-options"
    type="number"
    min="500"  // Browser-native minimum constraint
    value={frequency}
    onChange={(e) => {
      const value = Math.max(500, parseInt(e.target.value) || 500); // Enforces 500ms minimum
      setFrequency(value);
    }}
    onBlur={(e) => {
      if (e.target.value < 500) {
        setFrequency(500); // Reset to 500 if user leaves with invalid value
      }
    }}
    placeholder="Min 500ms"
    className="bg-slate-200 border rounded-lg h-9 border-gray-300 w-40 px-2"
  />
  <datalist id="frequency-options">
    <option value="500" label="Minimum" />
    <option value="1000" />
    <option value="1500" />
    <option value="2000" />
    <option value="3000" />
  </datalist>
</div>
               </div>
               <div>
               <button
        className="w-full px-4 py-2 border  mt-5  bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={getFormulaInfo}
      >
        Check Formula
      </button>
      {checkMessage!==null && <p className='text-green-500'>{checkMessage}</p>}
               <button
        className="w-full px-4 py-2 border  mt-5  bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleSave}
        disabled={!enableSave}
        
      >
        Save Formula
      </button>
               </div>
            </div>
        
        <div className="flex flex-row">

            </div>
            <AutocompleteInput suggestions={variables} placeholder={"Type Variables here"} onSelect={(value)=>{setFormula((prev)=>prev+value)}} setEmpty={true}/>
      
      </div>

     <div>
        {formulas.map((variable , index)=>{
              return(
                <ListCardFormula key={index}  title={variable} serverName={serverName}/>
              )
            })}
     </div>
      
      
    </div>
  );
};

export default FormulaBuilder;