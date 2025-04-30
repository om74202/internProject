import axios from "axios"
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import evaluateExpression from "./evalExpression";
import AutocompleteInput from "./AutoCompleteInput";

export const ListCard=({title})=>{
  const [isEditOpen , setIsEditOpen] = useState(false);
  const [showMessage , setShowMessage] = useState(false)
  const [variableName , setVariableName] = useState(title)
  const [tagName , setTagName] = useState('');
  const [expression , setExpression] = useState("")
  const [frequency , setFrequency] = useState("");
  const [nodeId , setNodeId] = useState("");
  const [dataType , setDataType] = useState("")
  const {serverName} = useParams();
  const [message , setMessage] = useState("");
  const [tags,setTags] = useState([]);
  const fetchNodeId = async () => {
    const response =  await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/tags/${tagName}`);

      setNodeId(response.data.nodeId)
      console.log("nodeid modified is ", response.data.nodeId)
    }

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/${title}`);
          console.log(response.data)
          setFrequency(response.data.frequency);
          setExpression(response.data.expression)
          setNodeId(response.data.nodeId)
          setTagName(response.data.nodeName)
          console.log("nodeid is ",response.data.nodeId)
        } catch (error) {
          console.error("Error fetching tags:", error);
        }
      };
    
      fetchData();
    }, []);

    useEffect(()=>{
      if(tagName!==""){
        fetchNodeId();
      }
    },[tagName])


  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/serverTags/${serverName}`);
        setTags(response.data.map((item) => item.name));
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
  
    fetchTags();
  }, []);


  const fetchValue=async()=>{
    try{const response1=await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`)
    const endurl=response1.data.endurl
    const username=response1.data.username
    const password=response1.data.password
    const securityPolicy=response1.data.securityPolicy
    const securityMode=response1.data.securityMode
    const response2=await axios.post(`${process.env.REACT_APP_BASE_URL}/fetchTag`,{
      variable:{name:variableName , nodeId:nodeId},
      endurl:endurl
      ,username:username,
      password:password,
      securityMode:securityMode,
      securityPolicy:securityPolicy,
    })
    const value=evaluateExpression(response2.data.data.value+expression)

    if(response2.data.data.status==="good"){
      setMessage(`Fetch successfull  Value:${value}`)
    setShowMessage(true);
    }else{
      setMessage("Fetch Failed")
      setShowMessage(true)
    }
    
    

    }catch(e){
      setMessage("Fetch Failed");
      setShowMessage(true)
    }
  }

  


    const saveVariable = async ()=>{
      try{
          const response=await axios.put(`${process.env.REACT_APP_BASE_URL}/addVariable`,{
            currentName:title,
            newName:variableName,
            nodeId:nodeId,
            expression:expression,
            frequency:frequency,
            nodeName:tagName,
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })
          setIsEditOpen(false)
        
        alert("Variable updated Successfully")
      }catch(e){
        alert("internal Server error")
      }
    }

  




    


    const handleDelete=async()=>{
        try{const response =await axios.delete(`${process.env.REACT_APP_BASE_URL}/addVariable/${title}`);
        alert(response.data.message);
        }catch(e){
            console.log(e);
            alert("delete unsucessful , variable is associated to a formula",)
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
            <h2 className="text-xl font-bold mb-4">Edit Variable</h2>

            <div className="mb-4">
              <label className="block text-gray-700">Variable Name</label>
              <input
              value={variableName}
              onChange={(e)=>{setVariableName(e.target.value)}}
              
                type="text"
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter Expression"
              />
            </div>
            <AutocompleteInput suggestions={tags} value={tagName}  onSelect={(value)=>{setTagName(value)}} placeholder={"Select Tag"}/>

            <div className="mb-4">
              <label className="block text-gray-700">Expression</label>
              <input
              value={expression}
              onChange={(e)=>{setExpression(e.target.value)}}
              
                type="text"
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter Expression"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Frequency </label>
              <input
              value={frequency}
              onChange={(e)=>{setFrequency(e.target.value)}}
                type="text"
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter Frequency"
              />

<button
               onClick={fetchValue} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
              >
                fetch Data
              </button>
              {showMessage && (<div className="bg-green-500">
                {message}
              </div>)}
            </div>

            
            
            <div className="flex justify-between">
              <button onClick={saveVariable}
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