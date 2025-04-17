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
  const [error , setError ] = useState("")
  const [socket , setSocket] = useState(null);
  

  const [savedMessage , setSavedMessage] = useState("")
  const [showSavedMessage , setShowSavedMessage] = useState(false)
    // row Delete
    const [selectedRowId , setSelectedRowId] = useState(null);
    const [selectedNodeId , setSelectedNodeId] = useState(null)
    //frequency for data subscription
    const [frequency , setFrequency] = useState(1000)
    const [showError , setShowError] = useState(false)


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
    console.log(id);
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
    const newSocket = new WebSocket(`${process.env.REACT_APP_BASE_URL}/getTagsSub`);

    newSocket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setTags((prevTags) =>
        prevTags.map((tag) =>
          tag.id === message.type ? { ...tag, valueMag: message.data.value , status:message.data.status , dataType:message.data.dataType , timestamp:message.data.timestamp} : tag,
      // console.log("----->",message.type)
        )
      );
    };

    newSocket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    setSocket(newSocket);

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
        }
      `}
    >
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
    alert(e)
    }
  }



  



  
  

  return (
    <div className="flex bg-white h-screen  font-sans">
  <DndContext onDragEnd={handleDragEnd}>

    {/* Node Browser Sidebar */}
    <div className="w-1/5 h-full bg-white shadow-md p- border-l overflow-auto">
      <div className="space-y-4">

        <div>
          <h2 className="text-sm font-semibold  mt-4 mb-2">Browse Nodes</h2>
          <div className="">
            {nodes.length >= 0 ? renderNodes(nodes) : <p>No nodes loaded.</p>}
          </div>
        </div>
      </div>
    </div>
    
    {/* Tag Table Section */}
    <DropZone  id="DropZone">
    <div className="w-4/5  h-screen overflow-hidden p-4">

    <input
  type="number"
  value={frequency}
  onChange={(e) => {
    const inputVal = e.target.value;
    setFrequency(inputVal);

    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 500) {
      setFrequency(parsed);
      setShowError(false)
      setError("");
    } else {
      setShowError(true)
      setError("Enter a value more than 500ms");
    }
  }}
  placeholder="Enter subscription frequency in milliseconds"
  className="bg-slate-200 border rounded-lg h-9 border-gray-300 w-40 px-2"
/>

{showError && (
  <p className="text-red-500 text-sm mt-1">{error}</p>
)}


    
      
        <div className="h-full flex flex-col space-y-4">
          <h1 className="text-2xl font-semibold mb-2">Selected Tags</h1>
          <div className="overflow-auto border rounded shadow-sm bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr>
                  <th className="px-4 py-2 border">S. No.</th>
                  <th className="px-4 py-2 border">Node ID</th>
                  <th className="px-4 py-2 border">Value</th>
                  <th className="px-4 py-2 border">Data Type</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Time_Stamp</th>
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
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{tag.id}</td>
                    <td className="px-4 py-2 border">{tag.valueMag || 'N/A'}</td>
                    <td className="px-4 py-2 border">{tag.dataType || 'Unknown'}</td>
                    <td className="px-4 py-2 border">{tag.name}</td>
                    <td className="px-4 py-2 border">{tag.status}</td>
                    <td className="px-4 py-2 border">{tag.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={saveTags}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
             {showSavedMessage ? "Tags Saved" : "Save Tags"}
            </button>
            <button
              onClick={() => navigate(`/AddVariable/${serverName}`)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Add Variable
            </button>
          </div>
        </div>
      
    </div>
    </DropZone>

    
  </DndContext>
</div>

    
        )
}

export default Tags
