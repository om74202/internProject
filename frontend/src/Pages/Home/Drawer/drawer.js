import React from "react";
import { BsDisplayport } from "react-icons/bs";
import { GrGraphQl, GrUserAdmin } from "react-icons/gr";
import { useState } from "react";

import {
  MdJoinFull,
  MdJoinLeft,
  MdLocationSearching,
  MdOutlineHealthAndSafety,
  MdOutlineWifiPassword,
} from "react-icons/md";
import { SiStatuspal } from "react-icons/si";
import { NavLink, Outlet, useNavigate , useLocation , matchPath} from "react-router-dom";
import Logo from "../../../Assets/Logo/DarkLogo.png";
import { BiEdit, BiLogOut } from "react-icons/bi";
import { LinkOutlined, WifiOutlined } from "@ant-design/icons";



<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-tags" viewBox="0 0 16 16">
  <path d="M3 2v4.586l7 7L14.586 9l-7-7zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586z"/>
  <path d="M5.5 5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m0 1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M1 7.086a1 1 0 0 0 .293.707L8.75 15.25l-.043.043a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 0 7.586V3a1 1 0 0 1 1-1z"/>
</svg>

const Drawer = () => {

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

const toggleSidebar = () => {
  setIsSidebarVisible(!isSidebarVisible);
};


  const navigate = useNavigate()
  const location = useLocation();

const hiddenRoutes = ['/login', '/tags/:serverName', '/addVariable/:serverName'];

const shouldHideSidebar = hiddenRoutes.some((routePattern) =>
  matchPath(routePattern, location.pathname)
);


  const handleSignOut = () => {
    localStorage.setItem("isAuth", "false")
    navigate('/login')
  }

  return (
    <div className="relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-800 text-white flex items-center justify-between px-2 z-50 shadow-lg">
        <div>
          <img src={Logo} className="w-36 object-cover" alt="Logo-Opsight" />
        </div>
        <div className="flex items-center justify-center gap-5  mr-5">
        <button
  onClick={toggleSidebar}
  className="text-white bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
>
  {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
</button>

          <button onClick={handleSignOut} className="flex gap-2 items-center justify-center focus:outline-none text-gray-300 hover:text-gray-400">
            <span className="text-2xl">
              <BiLogOut />
            </span>
            Signout
          </button>
        </div>
      </div>

      {/* Always Open Drawer */}
      {/* <div className="fixed top-16 left-0 w-64 h-full bg-white text-black border-r-2">
        <div className="p-6">
          <ul>
            <li className="mt-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <SiStatuspal /> Network Status
                </span>
              </NavLink>
            </li>
            <li className="mt-6">
              <NavLink
                to="/wifi-config"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <MdOutlineWifiPassword /> Wi-Fi Configuration
                </span>
              </NavLink>
            </li>
            <li className="mt-6">
              <NavLink
                to="/ip-config"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <MdLocationSearching /> IP Configuration
                </span>
              </NavLink>
            </li>
            <li className="mt-6">
              <NavLink
                to="/health-monitor"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <MdOutlineHealthAndSafety /> Health Monitoring
                </span>
              </NavLink>
            </li>
            <li className="mt-6">
              <NavLink
                to="/port-config"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <BsDisplayport /> Port Configuration
                </span>
              </NavLink>
            </li>
            <li className="mt-6">
              <NavLink
                to="/mqtt-connection"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <WifiOutlined /> MQTT Connection
                </span>
              </NavLink>
            </li>
            <li className="mt-6">
              <NavLink
                to="/gateway-protocols"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <GrGraphQl />Connection Servers
                </span>
              </NavLink>
            </li>
            <li className="mt-6">
              <NavLink
                to="/admin-config"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-black"
                }
              >
                <span className="flex gap-2 items-center justify-start">
                  <GrUserAdmin /> Admin Configuration
                </span>
              </NavLink>
            </li>

            
          </ul>
        </div>
      </div> */}

{!shouldHideSidebar && isSidebarVisible && (
        <div className="fixed top-16 left-0 w-64 h-full bg-white text-black border-r-2">
          <div className="p-6">
            <ul>
              <li className="mt-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <SiStatuspal /> Network Status
                  </span>
                </NavLink>
              </li>
              <li className="mt-6">
                <NavLink
                  to="/wifi-config"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <MdOutlineWifiPassword /> Wi-Fi Configuration
                  </span>
                </NavLink>
              </li>
              <li className="mt-6">
                <NavLink
                  to="/ip-config"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <MdLocationSearching /> IP Configuration
                  </span>
                </NavLink>
              </li>
              <li className="mt-6">
                <NavLink
                  to="/health-monitor"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <MdOutlineHealthAndSafety /> Health Monitoring
                  </span>
                </NavLink>
              </li>
              <li className="mt-6">
                <NavLink
                  to="/port-config"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <BsDisplayport /> Port Configuration
                  </span>
                </NavLink>
              </li>
              <li className="mt-6">
                <NavLink
                  to="/mqtt-connection"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <WifiOutlined /> External Connection
                  </span>
                </NavLink>
              </li>
              <li className="mt-6">
                <NavLink
                  to="/gateway-protocols"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <GrGraphQl /> Edge Connectivity
                  </span>
                </NavLink>
              </li>
              <li className="mt-6">
                <NavLink
                  to="/admin-config"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-black"
                  }
                >
                  <span className="flex gap-2 items-center justify-start">
                    <GrUserAdmin /> Admin Configuration
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
  className={`${shouldHideSidebar || !isSidebarVisible ? "ml-0" : "ml-64"} mt-16 p-4`}
>
  <Outlet />
</div>

    </div>
  );
};

export default Drawer;
