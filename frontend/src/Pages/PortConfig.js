import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const FirewallPortConfiguration = () => {

  const [port, setPort] = useState([])
  const [portNumber, setPortNumber] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPortProfiles = () => {
    fetch(`${process.env.REACT_APP_BASE_URL}/getFirewallPorts`)
      .then((response) => response.json())
      .then((data) => setPort(data))
      .catch((error) => console.error("Error fetching Ethernet profiles:", error));
  };

  // Load profiles when component mounts
  useEffect(() => {
    fetchPortProfiles()
  }, []);

  const handleAddPort = () => {
    const body = {
      portNumber: portNumber,
    };

    fetch(`${process.env.REACT_APP_BASE_URL}/addPort`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully deleted:");
        fetchPortProfiles(); 
        setIsModalOpen(false);
        toast.success(`Port Added Successfully!`, {
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
        console.error("Error deleting Ethernet profile:", error);
      });
  };

  const handleDeletePort = (port) => {
    const body = {
      portNumber: `${port}`,
    };

    fetch(`${process.env.REACT_APP_BASE_URL}/deletePort`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully deleted:");
        fetchPortProfiles(); 
        toast.error(`Port Deleted Successfully!`, {
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
        console.error("Error deleting Ethernet profile:", error);
      });
  };


  return (
    <div className="flex flex-col justify-center items-center h-auto py-8">
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl">
        {/* Header */}
        <ToastContainer />
        <div className="flex justify-between items-center bg-gray-900 text-white py-3 px-6 rounded-t-lg">
          <h2 className="text-lg font-bold">Firewall Port Configuration</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            OPEN PORT
          </button>
        </div>

        {/* Port Table */}
        <div className="p-6">
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 ">
                <th className="py-2 px-4 border-b">#</th>
                <th className="py-2 px-4 border-b">Port Number</th>
                <th className="py-2 px-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <br/>
            <tbody>
              {port.map((port, index) => (
                <tr key={port}>
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{port}</td>
                  <td className="py-2 px-4 border-b text-right">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                      onClick={() => handleDeletePort(port)}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Add Port
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700">IP Address</label>
              <input
                type="text"
                value={portNumber}
                onChange={(e) => setPortNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter Port Number"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleAddPort}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
                disabled={portNumber == ''}
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
    </div>
  );
};

export default FirewallPortConfiguration;
