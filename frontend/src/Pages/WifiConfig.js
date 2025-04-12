import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";


const WifiConnections = () => {
  const [wifiList, setWifiList] = useState([]);
  const [selectedSSID, setSelectedSSID] = useState(null);
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSSID, setCurrentSSID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleScan = () => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_BASE_URL}/getWiFiNetworks`)
      .then((response) => response.json())
      .then((data) => {
        setWifiList(data);
        setIsLoading(false);
        toast.success('Scanning Complete!', {
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
        console.error('Error fetching Wi-Fi networks:', error);
        setIsLoading(false);
      });
  }

  useEffect(() => {
    handleScan();
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/getCurrentSSID`)
      .then((response) => response.json())
      .then((data) => setCurrentSSID(data.SSID))
      .catch((error) => console.error('Error fetching current SSID:', error));
  }, []);

  const handleConnectClick = (ssid) => {
    setSelectedSSID(ssid);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const body = {
      ssid: selectedSSID,
      password: password,
    };

    fetch(`${process.env.REACT_APP_BASE_URL}/connectWiFi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Successfully sent Wi-Fi credentials:", data);
        setIsSubmitting(false);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error('Error sending Wi-Fi credentials:', error);
        setIsSubmitting(false);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-start mt-10 h-screen">
      <ToastContainer />
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl">
        <div className="bg-gray-900 text-white flex justify-between items-center py-3 px-6 rounded-t-lg">
          <h2 className="text-lg font-bold">Wi-Fi Connections</h2>
          <button onClick={handleScan} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            SCAN AVAILABLE NETWORK
          </button>
        </div>

        <div className="p-4">
          <p>
            Current SSID: <span className="font-semibold">{currentSSID}</span>
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="loader"></div> 
              <p className="ml-3 animate-bounce">Scanning for networks...</p>
            </div>
          ) : (
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b-2 text-left text-gray-600">#</th>
                  <th className="px-6 py-3 border-b-2 text-left text-gray-600">SSID Name</th>
                  <th className="px-6 py-3 border-b-2 text-right text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {wifiList.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{item}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                        onClick={() => handleConnectClick(item)}
                      >
                        CONNECT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Connect to {selectedSSID}</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Enter Wi-Fi Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} // Toggle between password and text
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md mt-2"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 px-3 py-2 text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              {isSubmitting ? (
                <h2 className=" w-full text-md animate-bounce text-center text-blue-400">Submitting...</h2>
              ) : (
                <>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
                    onClick={handleSubmit}
                    disabled = {password == ''}
                  >
                    Submit
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WifiConnections;