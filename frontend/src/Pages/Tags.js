import { useEffect, useState } from 'react'
import axios from 'axios'
import {useDroppable,DndContext,useDraggable} from '@dnd-kit/core';
import { DraggableItem } from '../components/DragandDrop/draggable';
import { DropZone } from '../components/DragandDrop/droppable';
import { LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// import { ChevronDownIcon , ChevronRightIcon } from '@heroicons/react'
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { FolderIcon} from '@heroicons/react/24/solid';
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon';
import AutocompleteInput from '../components/AutoCompleteInput';
import { useParams } from 'react-router-dom';













//  drag and drop logic 




const Tags=()=>{
  const navigate=useNavigate()
  // server credentials
  const [username , setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [securityMode , setSecurityMode] = useState("")
  const [securityPolicy , setSecurityPolicy] = useState("")
  const {serverName} = useParams();
  const [endpoint, setEndpoint] = useState(""); // OPC UA Endpoint
  const [nodes, setNodes] = useState([]); // Stores the root nodes
  const [expandedNodes, setExpandedNodes] = useState({});
  const [certificate , setCertificate] = useState(null);
  const [tags , setTags]=useState([]); 
  const [nodeIds , setNodeIds]= useState([]);
  const [error , setError ] = useState("")
  const [socket , setSocket] = useState(null);
  const [socket2,setSocket2]=useState(null)
  const [savedTags , setSavedTags]=useState([])
  const [showSavedTags , setShowSavedTags]=useState(false);
  const [selectedSavedTag , setSelectedSavedTag]=useState(null)
  

  const [savedMessage , setSavedMessage] = useState("")
  const [showSavedMessage , setShowSavedMessage] = useState(false)
    // row Delete
    const [selectedRowId , setSelectedRowId] = useState(null);
    const [selectedNodeId , setSelectedNodeId] = useState(null)
    //frequency for data subscription
    const [frequency , setFrequency] = useState(1000)
    const [showError , setShowError] = useState(false)

    useEffect(() => {
      const fetchTags = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/serverTags/${serverName}`);
          setNodeIds(response.data.map((item) => item.nodeId));
          setSavedTags(response.data);
        } catch (error) {
          console.error("Error fetching tags:", error);
        }
        
      };
    
      fetchTags();

      
    }, []);
    const validateTags = () => {
      for (const row of tags) {
        if (row.valueMag === undefined || Number.isNaN(row.valueMag)) {
          alert(`Validation Error: Variable "${row.name}" has an invalid value.`);
          return false;
        }
        if ( row.status.toLowerCase() !== "good") {
          alert(`Validation Error: Variable "${row.name}" has a bad status.`);
          return false;
        }
        return true;
      }
    };

    useEffect(()=>{
      const fetchRetentionTags= async()=>{
        try{
          const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/RetentionTags`,{
            endUrl:endpoint,
            nodeIds:nodeIds,
            username:username,
            password:password,
            securityMode:securityMode,
            securityPolicy:securityPolicy,
            frequency:frequency
          })
        }catch(e){
          console.log("error in fetching tags");
        }
      }
      fetchRetentionTags();
    },[endpoint])
    

    useEffect(() => {
      const initializeServer = async () => {
        try {
          // 1. First fetch server details
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`
          );
          
          const { 
            endurl, 
            username: serverUsername, 
            password: serverPassword,
            securityMode: serverSecurityMode,
            securityPolicy: serverSecurityPolicy 
          } = response.data;
    
          // 2. Update state synchronously
          setEndpoint(endurl);
          setUsername(serverUsername);
          setPassword(serverPassword);
          setSecurityMode(serverSecurityMode);
          setSecurityPolicy(serverSecurityPolicy);
    
          // 3. Immediately fetch nodes with the new values
          const rootNodes = await fetchNodes("RootFolder", {
            endUrl: endurl,
            securityPolicy: serverSecurityPolicy,
            securityMode: serverSecurityMode,
            username: serverUsername,
            password: serverPassword,
            frequency
          });
    
          setNodes(rootNodes);
        } catch (error) {
          console.error("Initialization error:", error);
        }
      };
    
      initializeServer();
    }, [serverName]);

   


    useEffect(()=>{
      try{
        const setData=async ()=>{
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`);
          setEndpoint(response.data.endurl)
          setUsername(response.data.username);
          setPassword(response.data.password);
          setSecurityMode(response.data.securityMode);
          setSecurityPolicy(response.data.securityPolicy);
          setCertificate(response.data.certificate)
        }
        setData();
      }catch{
        console.log("error in first")
      }
    },[])
    
 

  



  function handleDragEnd(event) {
    const { over, active } = event;

    if (over && over.id === "DropZone") {
      //console.log("active is now ",active.data.current.node);
      setTags((prev)=>[...prev,active.data.current.node])
    }
  }
  // keyboad delete event 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedRowId !== null) {
        setTags((prevTags) => prevTags.filter((tag) => tag.id !== selectedRowId));
        setSelectedRowId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRowId]);

  const handleRowClick = (id) => {
    setSelectedRowId(id);
  };




  const fetchNodes = async (nodeId = "RootFolder" , overrideParams = {}) => {
    try {
      const params = {
        endUrl: endpoint,
        url: endpoint,
        nodeId,
        securityPolicy,
        securityMode,
        username,
        password,
        frequency,
        ...overrideParams // Allow overriding defaults
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/getTagsSub`,
        params
      );
      return response.data.nodes;
    } catch (error) {
      console.error("Error fetching nodes:", error);
      return [];
    }
  };

  useEffect(() => {
    const newSocket = new WebSocket(`${process.env.REACT_APP_BASE_URL}/RetentionTags`);

    newSocket.onopen = () => {
      console.log("✅ WebSocket connected for saved tags");
    };

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      setSavedTags((prevTags) =>
        prevTags.map((tag) =>
          tag.nodeId === message.type // or tag.tagName if that's your identifier
            ? {
                ...tag,
                id:message.data.id,
                valueMag: message.data.value,
                status: message.data.status,
                dataType: message.data.dataType,
                timestamp: message.data.timestamp,
              }
            : tag
        )
      );
    };
    console.log("saved tags ",savedTags)

    newSocket.onclose = () => {
      console.log("❌ WebSocket disconnected for saved tags");
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const newSocket = new WebSocket(`${process.env.REACT_APP_BASE_URL}/getTagsSub`);

    newSocket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setTags((prevTags) =>
        prevTags.map((tag) =>
          tag.id === message.type ? { ...tag,  valueMag: message.data.value , status:message.data.status , dataType:message.data.dataType , timestamp:message.data.timestamp} : tag,
  
        )
      );
    };

    newSocket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    setSocket2(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // console.log(expandedNodes)

  const handleNodeClick = async (nodeId) => {
    if (expandedNodes[nodeId]) {
      
      setExpandedNodes((prev) => ({ ...prev, [nodeId]: null }));
    } else {
      
      const children = await fetchNodes(nodeId);
      setExpandedNodes((prev) => ({ ...prev, [nodeId]: children }));
      
    }

  };

  const handleConnect = async () => {
    const rootNodes = await fetchNodes();
    setNodes(rootNodes);
  };

  const renderNodes = (nodes, depth = 0) => (
    <ul
      className={`
        ${depth === 0 
          ? 'border rounded-2xl  shadow-sm ' 
          : ''
        } text-xs
      `}
    >
      {nodes.length===0 && <p className='text-center font-bold text-red-500 text-xl'>No nodes found</p>}
      {nodes.map((node) => (
        <li key={node.id} className="">
          <div 
            onClick={() => handleNodeClick(node.id)}
            className={`
              flex  cursor-pointer
              ${selectedNodeId === node.id ? 'bg-amber-200' : ''}
            `}
          >
            {/* Expand/collapse icon */}
            <span className="w-3 text-amber-500 mr-2">
              {expandedNodes[node.id] ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </span>
            
            {/* Node name with optional value icon */}
            <DraggableItem id={node.id} node={node}>
              <div className="flex items-center flex-1 min-w-0">
                {node.valueMag !== null && (
                  <LinkOutlined className=" " />
                )}
                <span>
                {node.name}
                </span>
              </div>
            </DraggableItem>
          </div>
  
          {/* Recursive render for children */}
          {expandedNodes[node.id] && expandedNodes[node.id].length > 0 && (
            <div className=" border-l-2 border-amber-200 pl-3">
              {renderNodes(expandedNodes[node.id], depth + 1)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
  


  const handleDelete = (id) => {
    setTags(prevTags => {
      return prevTags.filter(tag => tag.id !== id);
    });
  };

  const handleContextMenu =(event,id) => {
    event.preventDefault(); // Prevent default right-click menu
    const confirmDelete = window.confirm("Do you want to delete this row?");
    if (confirmDelete) {
      handleDelete(id);
    }
  };

  const saveTags = async ()=>{
    if(tags.length===0){
      alert("Please add some tags to save");
      return;
    }else if(!validateTags()){
      return;
    }

    try{
      const responses = await Promise.all(
      tags.map(tag => axios.post(`${process.env.REACT_APP_BASE_URL}/addVariable/tags`, {
          nodeId: tag.id,          
          name: tag.name,
          dataType: tag.dataType,
          serverName:serverName
      }))
  );
  setSavedMessage("Tags Saved");
  setShowSavedMessage(true)
  const newSocket = new WebSocket(`${process.env.REACT_APP_BASE_URL}/getTagsSub`);
    setSocket(newSocket);
    }catch(e){
      console.log(e);
      const newSocket = new WebSocket(`${process.env.REACT_APP_BASE_URL}/getTagsSub`);
    setSocket(newSocket);
    alert("Can't save Variables Already saved")
    }
  }

  const handleTagDelete=async(id)=>{
    setSelectedSavedTag(id);
    const handleKeyDown = async(e) => {
      if (e.key === 'Delete' && id !== null) {
        try{
          const response=await axios.delete(`${process.env.REACT_APP_BASE_URL}/addVariable/deleteTag/${id}/${serverName}`)
          alert(response.data.message)
          setSavedTags((prev)=>prev.filter((tag)=>tag.nodeId!==id))
          setSelectedSavedTag(null)
        }catch(e){
          alert("Internal Server Error")
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    
  }



  



  
  

  return (
    <div className="flex bg-white h-screen  font-sans">
  <DndContext onDragEnd={handleDragEnd}>

    {/* Node Browser Sidebar */}
    <div className="w-1/5 h-full bg-white shadow-md   overflow-auto">
      <div className="">

        <div><h3 className='font-bold '>Server Name-{serverName}</h3>
          <h2 className="text-sm font-semibold">Browse Nodes</h2>
          <div className="">
            {nodes.length >= 0 ? renderNodes(nodes) : <p>No nodes loaded.</p>}
          </div>
        </div>
      </div>
    </div>
    
    {/* Tag Table Section */}
    <DropZone  id="DropZone">


<div className="flex justify-end">
  <label className='font-semibold'>Browsing Frequency <span className='text-gray-500 text-sm'>in milliseconds</span> </label>
  <input
    list="frequency-options"
    type="number"
    value={frequency}
    onChange={(e) => {
      const inputVal = e.target.value;
      setFrequency(inputVal);

      const parsed = parseInt(inputVal, 10);
      if (!isNaN(parsed) && parsed >= 500) {
        setFrequency(parsed);
        setShowError(false);
        setError("");
      } else {
        setShowError(true);
        setError("Enter a value more than 500ms");
      }
    }}
    placeholder="Enter or select frequency (ms)"
    className="bg-slate-200 border rounded-lg h-9 border-gray-300 w-40 px-2"
  />
  <datalist id="frequency-options">
    <option value="600" />
    <option value="1000" />
    <option value="1500" />
  </datalist>
</div>

{showError && (
  <p className="flex justify-end text-red-500 text-sm mt-1">{error}</p>
)}
    <div className="w-5xl   overflow-hidden ">


    
      
        <div className="h-full flex flex-col ">
          <h1 className="text-xl font-semibold mb-1">Browsed Tags</h1>
          <div className="overflow-auto border rounded shadow-sm bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr>
                  <th className="px-4  border">S. No.</th>
                  <th className="px-4  border">Node ID</th>
                  <th className="px-4  border">Value</th>
                  <th className="px-4  border">Data Type</th>
                  <th className="px-4  border">Name</th>
                  <th className="px-4  border">Status</th>
                  <th className="px-4  border">Time_Stamp</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(tag.id)}
                    onContextMenu={(e) => handleContextMenu(e, tag.id)}
                    className={`cursor-pointer transition-all ${
                      selectedRowId === tag.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >{console.log(tag)}
                    <td className="px-4  border">{index + 1}</td>
                    <td className="px-4  border">{tag.id}</td>
                    <td className="px-4  border">{tag.valueMag || 'N/A'}</td>
                    <td className="px-4  border">{tag.dataType || 'Unknown'}</td>
                    <td className="px-4  border">{tag.name}</td>
                    <td className="px-4  border">{tag.status}</td>
                    <td className="px-4  border">{tag.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex  justify-end space-x-2">
            <button
              type="button"
              onClick={saveTags}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
            >
             {showSavedMessage ? "Tags Saved" : "Save Tags"}
            </button>
            <button
              onClick={() =>setShowSavedTags(!showSavedTags)}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
            >
              {showSavedTags ? "Hide Saved Tags":"Show Saved Tags"}
            </button>
            <button
              onClick={() => navigate(`/AddVariable/${serverName}/?freq=${frequency}`)}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
            >
              Add Variable
            </button>

            <button
              onClick={() => navigate(`/FormulaBuilder/${serverName}`)}
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
            >
              Add Formula
            </button>
          </div>
        </div>
      
    </div>

    {showSavedTags  && (
  <div className="overflow-x-auto mt-6">
    <table className="min-w-full divide-y divide-gray-300 bg-white shadow rounded-lg">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 max-h-3 border">S. No.</th>
          <th className="px-4 max-h-3 border">Tag Name</th>
          <th className="px-4 max-h-3 border">Value</th>
          <th className="px-4 max-h-3 border">Status</th>
          <th className="px-4 max-h-3 border">Data Type</th>
          <th className="px-4 max-h-3 border">Timestamp</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {savedTags.map((tag,index) => (
          <tr key={tag.id}
          className={`cursor-pointer transition-all ${
            selectedSavedTag === tag.id ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
          onClick={()=>handleTagDelete(tag.id)}>
            <td className="px-4 max-h-3 border">{index+1}</td>
            <td className="px-4 max-h-3 border">{tag.name}</td>
            <td className="px-4 max-h-3 border">{tag.valueMag}</td>
            <td className="px-4 max-h-3 border">{tag.status}</td>
            <td className="px-4 max-h-3 border">{tag.dataType}</td>
            <td className="px-4 max-h-3 border">{tag.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
   

 
    </DropZone>

 

  
 
    <div>
   

    </div>

    
  </DndContext>
</div>

    
        )
}

export default Tags
