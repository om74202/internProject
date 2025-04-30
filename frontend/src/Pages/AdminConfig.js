
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //for cloud credentials update
  const [isInfluxModalOpen , setIsInfluxModalOpen] = useState(false);
  const [influxUrl , setInfluxUrl] = useState("");
  const [influxToken , setInfluxToken] = useState("");
  const [influxOrgId , setInfluxOrgId] = useState("")
  const [influxBucketName , setInfluxBucketName] = useState("");

  useEffect(()=>{
    const fetchData=async()=>{
      try{
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/addVariable/getInfluxCredentials`)
        setInfluxUrl(response.data.url)
        setInfluxToken(response.data.apiToken);
        setInfluxOrgId(response.data.orgId)
        setInfluxBucketName(response.data.bucketName)
        console.log("credentials fetch successfully")
      }catch(e){
        console.log("error in fetching cloud credentials")
      }
    }
    fetchData()
  },[])

  const handleUpdateInfluxCredentials=async ()=>{
    try{
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/addVariable/updateCloudInflux`,{
        url:influxUrl,
        apiToken:influxToken,
        orgId:influxOrgId,
        bucketName:influxBucketName
      })
      alert("Credentials updated successfully");
      setIsInfluxModalOpen(false)
      
    }catch(e){
      alert("Error in updating Credentials , Make sure you are connected to database");
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () =>{
  }

  const handleSubmitAuth = () => {
    const url = `${process.env.REACT_APP_BASE_URL}/updateCredentials?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Authentication successful:", data);
        setIsModalOpen(false); // Close the modal on success
        toast.success(`Profile Changed Successfully!`, {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      })
      .catch((error) => {
        console.error("Error during authentication:", error);
      });
  };

  const handleReboot = () => {

    fetch(`${process.env.REACT_APP_BASE_URL}/reboot`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully Rebooted", data);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error('Error in Rebooting', error);
      });
  };

  const handleShutdown = () => {

    fetch(`${process.env.REACT_APP_BASE_URL}/shutdown`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully Rebooted", data);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error('Error in Rebooting', error);
      });
  };


  return (
    <div className="flex flex-col justify-center items-center h-auto py-8 space-y-8">
      <ToastContainer />
      {/* Real Time Clock Section */}
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl">
        <div className="bg-gray-900 text-white text-center py-3 rounded-t-lg">
          <h2 className="text-lg font-bold">Real Time Clock</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <h3 className="font-semibold">Current Date</h3>
            <p className="mt-2 text-lg">{currentTime.toISOString().split("T")[0]}</p>
          </div>
          <div>
            <h3 className="font-semibold">Current Time</h3>
            <p className="mt-2 text-lg">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Configuration Section */}
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl">
        <div className="bg-gray-900 text-white text-center py-3 rounded-t-lg">
          <h2 className="text-lg font-bold">Admin Configuration</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <h3 className="text-md">Change Username & Password</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-2"
            >
              CHANGE
            </button>
          </div>
          <div>
            <h3 className="text-md">Reboot Gateway</h3>
            <button onClick={handleReboot} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mt-2">
              REBOOT
            </button>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <h3 className="text-md">Shutdown</h3>
            <button
              onClick={handleShutdown}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mt-2"
            >
              SHUTDOWN
            </button>
          </div>
          <div>
            <h3 className="text-md">Change Cloud Credentials</h3>
            <button
              onClick={()=>setIsInfluxModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mt-2"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Changing Username & Password */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Username & Password</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new username"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password (Must be more than 6 charachters)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleSubmitAuth}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
                disabled={username == '' || password == '' || password.length < 6}
              >
                Submit
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isInfluxModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Enter Cloud Influx Credentials</h2>
            <div className="mb-4">
              <label className="block text-gray-700">URL </label>
              <input
                type="text"
                value={influxUrl}
                onChange={(e) => setInfluxUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new username"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Token </label>
              <input
                type="text"
                value={influxToken}
                onChange={(e) => setInfluxToken(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new Token"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Org Name</label>
              <input
                type="text"
                value={influxOrgId}
                onChange={(e) => setInfluxOrgId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new Organization Id"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Bucket Name</label>
              <input
                type="text"
                value={influxBucketName}
                onChange={(e) => setInfluxBucketName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter new Bucket Name"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleUpdateInfluxCredentials}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
              >
                Submit
              </button>
              <button
                onClick={() => setIsInfluxModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
