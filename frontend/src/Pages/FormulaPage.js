import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AutocompleteInput from '../components/AutoCompleteInput';
import { ListCardFormula } from '../components/FormulaCard';

const FormulaBuilder = () => {
  // Available variables from your system
  const [variables, setVariables] = useState([]);
  const [name , setName]=useState('');
  const [dataType , setDataType] =useState('')
  const {serverName} = useParams();
  const [frequency , setFrequency] = useState('')
  const [formulas , setFormulas] = useState([]);

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

        alert("variable saved Succesfully")
    }catch(e){
        alert("Please enter a unique name")
    }
  }



  



  // Available math functions
  const mathFunctions = ['sin', 'cos', 'tan', 'sqrt', 'log', 'abs'];

  return (
    <div className=" max-w-5xl mx-auto">
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
        onClick={handleSave}
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