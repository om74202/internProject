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









//  drag and drop logic 




const App1=()=>{
  const navigate=useNavigate()
  const [servers , setServers] = useState([]);
  // server credentials
  const [username , setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [securityMode , setSecurityMode] = useState("")
  const [securityPolicy , setSecurityPolicy] = useState("")
  const [ serverName , setServerName] = useState("")
  const [endpoint, setEndpoint] = useState(""); // OPC UA Endpoint
  const [nodes, setNodes] = useState([]); // Stores the root nodes
  const [expandedNodes, setExpandedNodes] = useState({});
  const [certificate , setCertificate] = useState(null);
  const [tags , setTags]=useState([]); 
  const [socket , setSocket] = useState(null);
    // row Delete
    const [selectedRowId , setSelectedRowId] = useState(null);
    const [selectedNodeId , setSelectedNodeId] = useState(null)
    //frequency for data subscription
    const [frequency , setFrequency] = useState("1000")
 

  

    //drag and drop logic

    useEffect(() => {
        const fetchServers = async () => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData`);
            setServers(response.data.map((server) => server.name));
          } catch (error) {
            console.error("Error fetching servers:", error);
          }
        };
      
        fetchServers();
      }, []);


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

  useEffect(()=>{
    const getEndpoint = async ()=>{
      try{
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/opcuaData/${serverName}`);
        setEndpoint(response.data.endurl)
        setUsername(response.data.username);
        setPassword(response.data.password);
        setSecurityMode(response.data.securityMode);
        setSecurityPolicy(response.data.securityPolicy);
        console.log(response.data)
      }catch(e){
        console.log("error while fetching endpoint", e)
      }
    }
    getEndpoint();
  },[serverName])


  const fetchNodes = async (nodeId = "RootFolder") => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/getTagsSub`, {
        endUrl: endpoint,
        url:endpoint,
        nodeId,
        securityPolicy:securityPolicy,
        securityMode:securityMode,
        username:username,
        password:password,
        frequency:frequency
      });
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
        space-y-1 
        ${depth === 0 
          ? 'border rounded-2xl p-4 shadow-sm bg-amber-50' 
          : ''
        }
      `}
    >
      {nodes.map((node) => (
        <li key={node.id} className="group">
          <div 
            onClick={() => handleNodeClick(node.id)}
            className={`
              flex items-center py-2 px-4 rounded-xl transition-all
              hover:bg-amber-100/80 cursor-pointer
              ${selectedNodeId === node.id ? 'bg-amber-200' : ''}
            `}
          >
            {/* Expand/collapse icon */}
            <span className="w-5 text-amber-500 mr-2">
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
                  <LinkOutlined className="text-amber-600 mr-2" />
                )}
                <span className="truncate font-semibold text-gray-700">
                  {node.name}
                </span>
              </div>
            </DraggableItem>
          </div>
  
          {/* Recursive render for children */}
          {expandedNodes[node.id] && expandedNodes[node.id].length > 0 && (
            <div className="ml-5 border-l-2 border-amber-200 pl-3">
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
  const newSocket = new WebSocket(`${process.env.REACT_APP_BASE_URL}/getTagsSub`);
    setSocket(newSocket);
    }catch(e){
      console.log(e);
      const newSocket = new WebSocket(`${process.env.REACT_APP_BASE_URL}/getTagsSub`);
    setSocket(newSocket);
    }
  }



  



  
  

  return (
    // <div className='flex flex-row-reverse'>
    //   <DndContext onDragEnd={handleDragEnd}>
    //   <div className='bg-gray-300 w-2/3 h-screen'> 
      
        

    //     //table

    //     <DropZone id="DropZone">
    //             <div className="h-screen"> 
    //             <div className="overflow-x-auto">
    //           <table className="min-w-full border border-gray-200">
    //             <thead>
    //               <tr className="bg-gray-200">
    //                 <th className="border px-4 py-2">S. No.</th>
    //                 <th className="border px-4 py-2">Node ID</th>
    //                 <th className="border px-4 py-2">Value</th>
    //                 <th className="border px-4 py-2">Data Type</th>
    //                 <th className="border px-4 py-2">Name</th>
    //                 <th className="border px-4 py-2">Status</th>
    //               </tr>
    //             </thead>
    //             <tbody>
    //               {tags.map((tag, index) => (
    //                 <tr key={index} onClick={()=> handleRowClick(tag.id)}
    //                 className={
    //                    "hover:bg-gray-100 cursor-pointer"+
    //                   (selectedRowId === tag.id ? " bg-gray-400" : "")
    //                 }
                    
                    
    //                 onContextMenu={(e) => handleContextMenu(e, tag.id)}>
    //                   <td className="border px-4 py-2">{index + 1}</td>
    //                   <td className="border px-4 py-2">{tag.id}</td>
    //                   <td className="border px-4 py-2">{tag.valueMag || "N/A"}</td>
    //                   <td className="border px-4 py-2">{tag.dataType || "Unknown"}</td>
    //                   <td className="border px-4 py-2">{tag.name}</td>
    //                   <td className="border px-4 py-2">{tag.status}</td>
    //                 </tr>
                    
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>

    //         <div>
    //         <div className='flex justify-end'>
    //         <button type="button" onClick={saveTags}  className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save Tags</button>

    //         <button type="button" onClick={()=>{navigate('/AddVariable')}}  className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Variable</button>

      
    // </div>
    //         </div>
    //             </div>
    //             </DropZone>
        
    //   </div>
     

    //   <div className='flex justify-start flex-col  w-1/3 '>
    //   <div className='py-4 '>
    //     <h2 >Enter the OPCUA Endpoint url</h2>
    //     {/* input for opcua  */}
      
    //   <input className=' border w-full' type='text' placeholder='opc.tcp://server_address:port' onKeyUp={(e)=>{
    //     setEndpoint(e.target.value);
    //   }}/>
    //   </div>

    //   <button className=' 
    //   text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium
    //    rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none
    //     dark:focus:ring-blue-800 w-1/4
    //   ' onClick={handleConnect}>Connect</button>
      
    //   <div className='py-6'>
    //     {nodes.length >= 0 ?  renderNodes(nodes) : <p>No nodes loaded.</p>}
    //   </div>

    //   </div>
    //   </DndContext>

      
      
    // </div>
    <div className="flex bg-white h-screen  font-sans">
  <DndContext onDragEnd={handleDragEnd}>

    {/* Node Browser Sidebar */}
    <div className="w-1/3 h-full bg-white shadow-md p-4 border-l overflow-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Your OPCUA Server
          </label>
          <AutocompleteInput suggestions={servers} onSelect={(value)=>{setServerName(value)}} />
        </div>


        <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter the Browsing  frequency (in milliseconds)
          </label>

        <input
        type="text"
        value={frequency}
        onChange={(value)=>{setFrequency(value.target.value)}}
        placeholder="Enter Subscription frequency in milliseconds"
        className="autocomplete-input bg-slate-200 border rounded-lg h-9 border-gray-300  w-full "
      />

        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Browse Tags
        </button>

        <div>
          <h2 className="text-lg font-semibold mt-4 mb-2">Browse Nodes</h2>
          <div className="space-y-2">
            {nodes.length >= 0 ? renderNodes(nodes) : <p>No nodes loaded.</p>}
          </div>
        </div>
      </div>
    </div>
    
    {/* Tag Table Section */}
    <div className="w-2/3 h-full overflow-hidden p-4">
      <DropZone id="DropZone">
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
              Save Tags
            </button>
            <button
              onClick={() => navigate('/AddVariable')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Add Variable
            </button>
          </div>
        </div>
      </DropZone>
    </div>

    
  </DndContext>
</div>

    
        )
}

export default App1
