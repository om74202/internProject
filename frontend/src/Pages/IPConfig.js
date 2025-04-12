import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

const StaticIPConfiguration = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEthModalOpen, setIsEthModalOpen] = useState(false);
  const [staticIP, setStaticIP] = useState("");
  const [routerIP, setRouterIP] = useState("");
  const [dnsServer, setDnsServer] = useState("");
  const [wifiProfiles, setWifiProfiles] = useState([]);
  const [ethProfiles, setEthProfiles] = useState([]);
  const [editMode, setEditMode] = useState(false); // For edit mode tracking
  const [profileToEdit, setProfileToEdit] = useState(null); // To store profile to be edited
  

  // Fetch the Wi-Fi static profilesi
  const fetchWifiProfiles = () => {
    fetch(`${process.env.REACT_APP_BASE_URL}/getWifiStatic`)
      .then((response) => response.json())
      .then((data) => setWifiProfiles(data))
      .catch((error) => console.error("Error fetching Wi-Fi profiles:", error));
  };

  // Fetch the Ethernet static profiles
  const fetchEthProfiles = () => {
    fetch(`${process.env.REACT_APP_BASE_URL}/getEthStatic`)
      .then((response) => response.json())
      .then((data) => setEthProfiles(data))
      .catch((error) => console.error("Error fetching Ethernet profiles:", error));
  };

  // Load profiles when component mounts
  useEffect(() => {
    fetchWifiProfiles();
    fetchEthProfiles();
  }, []);

  // Open Wi-Fi modal for Add or Edit
  const openWifiModal = (profile = null) => {
    setEditMode(!!profile); // If profile is provided, we are in edit mode
    if (profile) {
      setStaticIP(profile.staticIP);
      setRouterIP(profile.routerIP);
      setDnsServer(profile.dnsServer);
      setProfileToEdit(profile);
    } else {
      setStaticIP("");
      setRouterIP("");
      setDnsServer("");
      setProfileToEdit(null);
    }
    setIsModalOpen(true);
  };

  // Handle Wi-Fi profile submit
  const handleWifiSubmit = () => {
    const body = {
      staticIP: staticIP,
      routerIP: routerIP,
      dnsServer: dnsServer,
    };

    fetch(`${process.env.REACT_APP_BASE_URL}/editWifiProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully submitted:", data);
        setIsModalOpen(false);
        fetchWifiProfiles(); // Refresh the Wi-Fi profile list
        toast.success(`Wifi Profile ${editMode ? "Updated" : "Submited"} Successfully!`, {
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
        console.error("Error submitting data:", error);
      });
  };

  // Handle Wi-Fi profile delete
  const handleDeleteWifiProfile = (name) => {
    const body = {
      name: `interface ${name}`,
    };

    fetch(`${process.env.REACT_APP_BASE_URL}/deleteProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully deleted:", data);
        fetchWifiProfiles(); // Refresh the Wi-Fi profile list after deletion
        toast.error(`Wifi Profile Deleted Successfully!`, {
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
        console.error("Error deleting Wi-Fi profile:", error);
      });
  };

  // Open Ethernet modal for Add or Edit
  const openEthModal = (profile = null) => {
    setEditMode(!!profile); // If profile is provided, we are in edit mode
    if (profile) {
      setStaticIP(profile.staticIP);
      setRouterIP(profile.routerIP);
      setDnsServer(profile.dnsServer);
      setProfileToEdit(profile);
    } else {
      setStaticIP("");
      setRouterIP("");
      setDnsServer("");
      setProfileToEdit(null);
    }
    setIsEthModalOpen(true);
  };

  // Handle Ethernet profile submit
  const handleEthSubmit = () => {
    const body = {
      staticIP: staticIP,
      routerIP: routerIP,
      dnsServer: dnsServer,
    };

    fetch(`${process.env.REACT_APP_BASE_URL}/editEthernetProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully submitted:", data);
        setIsEthModalOpen(false);
        fetchEthProfiles(); // Refresh the Ethernet profile list
        toast.success(`Ethernet Profile ${editMode ? "Updated" : "Submited"} Successfully!`, {
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
        console.error("Error submitting data:", error);
      });
  };

  // Handle Ethernet profile delete
  const handleDeleteEthProfile = (name) => {
    const body = {
      name: `profile ${name}`,
    };

    fetch(`${process.env.REACT_APP_BASE_URL}/deleteProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully deleted:", data);
        fetchEthProfiles(); // Refresh the Ethernet profile list after deletion
        toast.error(`Wifi Profile Deleted Successfully!`, {
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
    <div className="flex flex-col justify-center items-center mt-10 h-auto py-8 space-y-8">
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl">
        <ToastContainer />
        <div className="flex justify-between items-center bg-gray-900 text-white py-3 px-6 rounded-t-lg">
          <h2 className="text-lg font-bold">WiFi Static IP Configuration</h2>
          <button
            onClick={() => openWifiModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            ADD WIFI PROFILE
          </button>
        </div>
        <div className="p-6">
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b">#</th>
                <th className="py-2 px-4 border-b">Profile Name</th>
                <th className="py-2 px-4 border-b">IP Address</th>
                <th className="py-2 px-4 border-b">Router Address</th>
                <th className="py-2 px-4 border-b">DNS</th>
                <th className="py-2 px-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wifiProfiles.map((profile, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{profile.name}</td>
                  <td className="py-2 px-4 border-b">{profile.staticIP}</td>
                  <td className="py-2 px-4 border-b">{profile.routerIP}</td>
                  <td className="py-2 px-4 border-b">{profile.dnsServer}</td>
                  <td className="py-2 px-4 border-b text-right space-x-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      onClick={() => openWifiModal(profile)}
                    >
                      EDIT
                    </button>
                    <button
                      className="bg-red-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      onClick={() => handleDeleteWifiProfile(profile.name)}
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

      {/* Ethernet Static IP Configuration */}
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center bg-gray-900 text-white py-3 px-6 rounded-t-lg">
          <h2 className="text-lg font-bold">Ethernet Static IP Configuration</h2>
          <button onClick={() => openEthModal()} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            ADD ETHERNET PROFILE
          </button>
        </div>
        <div className="p-6">
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b">#</th>
                <th className="py-2 px-4 border-b">Profile Name</th>
                <th className="py-2 px-4 border-b">IP Address</th>
                <th className="py-2 px-4 border-b">Router Address</th>
                <th className="py-2 px-4 border-b">DNS</th>
                <th className="py-2 px-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ethProfiles.map((profile, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{profile.name}</td>
                  <td className="py-2 px-4 border-b">{profile.staticIP}</td>
                  <td className="py-2 px-4 border-b">{profile.routerIP}</td>
                  <td className="py-2 px-4 border-b">{profile.dnsServer}</td>
                  <td className="py-2 px-4 border-b text-right space-x-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      onClick={() => openEthModal(profile)}
                    >
                      EDIT
                    </button>
                    {profile.name !== "static_eth0" && (
                      <button
                        className="bg-red-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                        onClick={() => handleDeleteEthProfile(profile.name)}
                      >
                        DELETE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding and Editing Wi-Fi Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Wi-Fi Profile" : "Add Wi-Fi Profile"}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700">IP Address</label>
              <input
                type="text"
                value={staticIP}
                onChange={(e) => setStaticIP(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter static IP address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Router Address</label>
              <input
                type="text"
                value={routerIP}
                onChange={(e) => setRouterIP(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter router IP address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">DNS</label>
              <input
                type="text"
                value={dnsServer}
                onChange={(e) => setDnsServer(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter DNS server address"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleWifiSubmit}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
                disabled={staticIP == '' || routerIP === '' || dnsServer === ''}
              >
                {editMode ? "Update" : "Submit"}
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

      {/* Modal for Adding and Editing Ethernet Profile */}
      {isEthModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Ethernet Profile" : "Add Ethernet Profile"}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700">IP Address</label>
              <input
                type="text"
                value={staticIP}
                onChange={(e) => setStaticIP(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter static IP address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Router Address</label>
              <input
                type="text"
                value={routerIP}
                onChange={(e) => setRouterIP(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter router IP address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">DNS</label>
              <input
                type="text"
                value={dnsServer}
                onChange={(e) => setDnsServer(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mt-2"
                placeholder="Enter DNS server address"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleEthSubmit}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
                disabled={staticIP == '' || routerIP === '' || dnsServer === ''}

              >
                {editMode ? "Update" : "Submit"}
              </button>
              <button
                onClick={() => setIsEthModalOpen(false)}
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

export default StaticIPConfiguration;