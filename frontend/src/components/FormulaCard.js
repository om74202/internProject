import axios from "axios"
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AutocompleteInput from "./AutoCompleteInput";


export const ListCardFormula=({title})=>{
  const [isEditOpen , setIsEditOpen] = useState(false);
  const [formulaName , setFormulaName] = useState('')
  const [expression , setExpression] = useState("")
  const [frequency , setFrequency] = useState("")
  const [dataType , setDataType] = useState("")
  const {serverName} = useParams();
  const [variables , setVariables]=useState([])


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


    const saveFormula = async ()=>{
      try{
          const response=await axios.put(`${process.env.REACT_APP_BASE_URL}/addFormula/update/${title}`,{
            newName:formulaName,
            expression:expression,
            frequency:frequency,
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            dataType:dataType
          })
          setIsEditOpen(false)
        
        alert("Variable updated Successfully")
      }catch(e){
        alert("internal Server error")
      }
    }

  




    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addFormula/${title}`);
          console.log(response.data)
          setFormulaName(response.data.name);
          setFrequency(response.data.frequency);
          setExpression(response.data.expression)
          setDataType(response.data.dataType)

        } catch (error) {
          console.error("Error fetching tags:", error);
        }
      };
    
      fetchData();
    }, []);


    const handleDelete=async()=>{
        try{const response =await axios.delete(`${process.env.REACT_APP_BASE_URL}/addFormula/deleteFormula/${title}`);
        console.log("deleted ", response.data)
        }catch(e){
            console.log(e);
            alert("delete unsucessful due to ",e);
        }
    }

    const handleEdit=async()=>{
      setIsEditOpen(true);
    }

    
    
    return (
        <div className="min-w-screen mx-auto  rounded-xl shadow-md overflow-hidden max-w-4xl  m-1">
  {/* <!-- Card Header with Icons --> */}
  <div className="flex justify-between items-center p-2 bg-green-100 hover:bg-green-200 border-b w-full">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <div className="flex space-x-2">
      {/* <!-- Edit Icon --> */}
      <button onClick={handleEdit}  class="text-blue-500 hover:text-blue-700 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      {/* <!-- Delete Icon --> */}
      <button onClick={handleDelete} class="text-red-500 hover:text-red-700 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>

  {isEditOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Formula</h2>

            <div className="">
              <label className="block text-gray-700">Formula Name</label>
              <input
              value={formulaName}
              onChange={(e)=>{setFormulaName(e.target.value)}}
              
                type="text"
                className="w-full px-4 py-2 border rounded-md "
                placeholder="Enter Formula Name"
              />
            </div>
            <div className="">
              <label className="block text-gray-700">Formula</label>
              <input
              value={expression}
              onChange={(e)=>{setExpression(e.target.value)}}
              
                type="text"
                className="w-full px-4 py-2  border rounded-md mt-2"
                placeholder="Enter Expression"
              />
            </div>
            <AutocompleteInput suggestions={variables} onSelect={(value)=>{setExpression((prev)=>prev+value)}} placeholder={"Select Variable"} setEmpty={true}/>


            <div className="">
              <label className="block text-gray-700">Frequency </label>
              <input
              value={frequency}
              onChange={(e)=>{setFrequency(e.target.value)}}
                type="text"
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter Frequency"
              />
            </div>
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
            
            
            <div className="flex justify-between">
              <button onClick={saveFormula}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
              >
                Submit
              </button>
              <button
                onClick={() => setIsEditOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
</div>
    )
}