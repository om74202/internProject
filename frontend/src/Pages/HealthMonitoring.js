import React, { useEffect, useState } from "react";
import { SunOutlined, RadarChartOutlined, PieChartOutlined, CloudServerOutlined } from "@ant-design/icons";
import { BiRefresh } from "react-icons/bi";

const HealthMonitor = () => {

  const [temp, setTemp] = useState('');
  const [cpu, setCpu] = useState('');
  const [memory, setMemory] = useState('');
  const [disk, setDisk] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  // Fetch Default Ethernet IP
  useEffect(() => {
    setIsLoading(true);
    setInterval(() =>{
      fetch(`${process.env.REACT_APP_BASE_URL}/temperature`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setTemp(data);
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)
      });

    fetch(`${process.env.REACT_APP_BASE_URL}/cpu`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setCpu(data);
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)
      });

    fetch(`${process.env.REACT_APP_BASE_URL}/memory`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setMemory(data);
        setIsLoading(false)

      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)

      });

    fetch(`${process.env.REACT_APP_BASE_URL}/disk`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setDisk(data);
        setIsLoading(false)

      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)

      });
    }, 5000)
  }, []);

  const handleFetchRefresh = () => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_BASE_URL}/temperature`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setTemp(data);
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)
      });

    fetch(`${process.env.REACT_APP_BASE_URL}/cpu`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setCpu(data);
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)
      });

    fetch(`${process.env.REACT_APP_BASE_URL}/memory`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setMemory(data);
        setIsLoading(false)

      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)

      });

    fetch(`${process.env.REACT_APP_BASE_URL}/disk`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        setDisk(data);
        setIsLoading(false)

      })
      .catch((error) => {
        console.log(error.msg)
        setIsLoading(false)

      });
  }

  return (
    <div className="flex flex-col justify-center items-center h-auto py-8 space-y-8">
      <div className="bg-white shadow-md rounded-lg w-full max-w-4xl p-6">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-center mb-4"> System Health Monitor</h2>
          <button onClick={handleFetchRefresh} className="text-2xl">
            <BiRefresh />
          </button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature Card */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold"><SunOutlined /> Temperature</h3>
            <p className="text-2xl mt-2 font-bold">{isLoading ? (
              <div className="flex justify-center items-center">
                <div className="loader"></div>
                <p className="ml-3 animate-bounce text-sm">Fetching...</p>
              </div>
            ) : (<>{temp.slice(1,temp.length-1)}</>)}</p>
          </div>

          {/* CPU Utilization Card */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold"><RadarChartOutlined /> CPU Utilization</h3>
            <p className="text-2xl mt-2 font-bold">{isLoading ? (
              <div className="flex justify-center items-center">
                <div className="loader"></div>
                <p className="ml-3 animate-bounce text-sm">Fetching...</p>
              </div>
            ) : (<>{cpu.slice(1,cpu.length-1)}</>)}</p>
          </div>

          {/* Memory Usage Card */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold"><CloudServerOutlined /> Memory Usage</h3>
            <p className="text-2xl mt-2 font-bold">{isLoading ? (
              <div className="flex justify-center items-center">
                <div className="loader"></div>
                <p className="ml-3 animate-bounce text-sm">Fetching...</p>
              </div>
            ) : (<>{memory.slice(1,memory.length-1)}</>)}</p>
          </div>

          {/* Disk Usage Card */}
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h3 className="text-md font-semibold"><PieChartOutlined /> Disk Usage</h3>
            <p className="text-2xl mt-2 font-bold">{isLoading ? (
              <div className="flex justify-center items-center">
                <div className="loader"></div>
                <p className="ml-3 animate-bounce text-sm">Fetching...</p>
              </div>
            ) : (<>{disk.slice(1,disk.length-1)}</>)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitor;
