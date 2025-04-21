import axios from "axios"
import {  useNavigate } from "react-router-dom";
import { useState , useEffect} from "react";


const extractIp = (endUrl) => {
  try {
    const match = endUrl.match(/^opc\.tcp:\/\/([\d.]+):\d+$/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
};

const extractPort = (endUrl) => {
  try {
    const match = endUrl.match(/^opc\.tcp:\/\/[\d.]+:(\d+)$/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
};

export const ServerListCard=({title , onDelete})=>{

    const [isEditOpen , setIsEditOpen] = useState(false);
    const [data , setData] = useState()
    const [endurl , setEndurl] = useState("");
    const [ip , setIp ] = useState("ini");
      const [port , setPort ] = useState("ini")

    const [username , setUsername] = useState("");
    const [password , setPassword] = useState("");
    const [certificate , setCertificate] = useState("");
    const [securityMode , setSecurityMode] = useState("") 
    const [securityPolicy , setSecurityPolicy] = useState("");
    const [name , setName ] = useState(title)
    const [connected , setConnected] = useState(false);
    const [message , setMessage ] = useState("")
    const  [status , setStatus]=useState("Disconnected");

    const navigate = useNavigate();

    const getEndUrl = () => `opc.tcp://${ip}:${port}`;
    
      useEffect(()=>{
        setEndurl(getEndUrl());
      },[ip, port])

      // status change 
      useEffect(()=>{

      },[status])



    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${title}`);
            setData(response.data);
            
            console.log(response);
          } catch (error) {
            console.error("Error fetching tags:", error);
          }
        };
      
        fetchData();
      }, [title]);


      useEffect(()=>{
        setIp(extractIp(endurl));
        setPort(extractPort(endurl));

      },[endurl])

      

      

      useEffect(() => {
        if (data) {
          setEndurl(data.endurl || "");
          setUsername(data.username || "");
          setPassword(data.password || "");
          setCertificate(data.certificate || "");
          setSecurityMode(data.securityMode || "None");
          setSecurityPolicy(data.securityPolicy || "None");
          setName(title || "");
        }
      }, [data, title ]);



    const handleDelete=async()=>{
        try{const response =await axios.delete(`${process.env.REACT_APP_BASE_URL}/addVariable/deleteOpcua/${title}`);
        console.log("deleted ", response.data)
        onDelete()
        }catch(e){
            console.log(e);
        }
    }

    const handleEdit=async()=>{
        setIsEditOpen(true)
    }
    const handleSave=async ()=>{
        try{
            const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/addVariable/updateOpcua/${title}`,{
                endurl:endurl,
                securityPolicy:securityPolicy,
                securityMode:securityMode,
                username:username,
                password:password,
                certificate:certificate,
              })
            setIsEditOpen(false)
        }catch{

        }
    }

    const checkConnection=async()=>{
        try{
          const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getTagsSub`, {
            endUrl: endurl,
            nodeId:"RootFolder",
            securityPolicy:securityPolicy,
            securityMode:securityMode,
            username:username,
            password:password,
          });
          console.log(response.data);
          if(response.data.status==="connected"){
            setConnected(true);
            setMessage("Connected to OPCUA server successfully!")
          }
        }catch(e){
          console.log(e);
          setConnected(false)
          setMessage("Failed to connect to opcuaServer")
        }
      }

      const handleBrowse= ()=>{
        navigate(`/tags/${title}`)
      }
    
    return (
        <div class="w-screen max-h-10   rounded-xl shadow-md overflow-hidden md:max-w-4xl  m-2">
  {/* <!-- Card Header with Icons --> */}
  <div class="flex justify-between items-center  bg-green-100 hover:bg-green-200 border-b">
    <h3 className="mb-2 text-md font-semibold text-gray-900">{title}</h3>
    <button type="button" onClick={()=>{status==="Connected"? setStatus("Disconnected") : setStatus("Connected")}} className={`min-w-10  rounded-lg px-1 ${status==="Disconnected" ? " bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}>{status}</button>
    
    
    
    <div class="flex space-x-2">

      {/* <!-- Edit Icon --> */}
      
      <button onClick={handleBrowse}  class="text-blue-500 hover:text-blue-700 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tags" viewBox="0 0 16 16">
<path d="M3 2v4.586l7 7L14.586 9l-7-7zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586z"/>
<path d="M5.5 5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1z"/>
</svg>
      </button>
      <button onClick={handleEdit}  class="text-blue-500 hover:text-blue-700 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
      {/* <!-- Delete Icon --> */}
      <button onClick={handleDelete} class="text-red-500 hover:text-red-700 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
  
      {isEditOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Enter Server Credentials</h2>
            <div className="">
              <label className="block text-gray-700">IP</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new IP"
              />
            </div>

            <div className="">
              <label className="block text-gray-700">PORT</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new IP"
              />
            </div>

            <div>
                  <label>Security Policy:</label>
                  <select
                    value={securityPolicy}
                    onChange={(e) => {
                      const selectedPolicy = e.target.value;
                      setSecurityPolicy(selectedPolicy);
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>None</option>
                    <option>Basic128Rsa15</option>
                    <option>Basic256</option>
                    <option>Basic256Sha256</option>
                    <option>Aes128_Sha256_RsaOaep</option>
                    <option></option>
                  </select>
                </div>
                <div>
                  <label>Security Mode:</label>
                  <select
                    value={securityMode}
                    onChange={(e) =>{
                      const selectedMode=e.target.value;
                      setSecurityMode(selectedMode)
                      if (selectedMode === "None") {
                        setSecurityPolicy("None");
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option>None</option>
                    {securityPolicy !== "None" && (
      <>
        <option>Sign</option>
        <option>Sign & Encrypt</option>
      </>
    )}
                  </select>
                </div>
            <div className="">
              <label className="block text-gray-700">Username </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new username"
              />
            </div>
            <div className="">
              <label className="block text-gray-700">password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new username"
              />
            </div>

            <div>
                  <label>Certificate:</label>
                  <input
                    type="file"
                    accept=".pem"
                    onChange={(e) => setCertificate(e.target.files[0])}
                    className="w-full px-4 py-2 border rounded-lg"
                    disabled={securityMode!=="None" || username!=="" || password!==""}
                  />
                </div>

                <div >
               <button type="button" className=' mt-6
      text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium
       rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none
        dark:focus:ring-blue-800
      'onClick={checkConnection} >{"connect"}</button>
               </div>

               {connected && (
          <p className="mt-4 text-green-500 font-bold">{message}</p>
        )}

                <div className="mt-6 flex justify-end space-x-2">
  <button
    onClick={() => setIsEditOpen(false)}
    className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
  >
    Cancel
  </button>
  <button
    onClick={handleSave}
    className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
    disabled={connected===false}
  >
    Save
  </button>
</div>
            
          </div>

    

        </div>
      )}
</div>
    )
}