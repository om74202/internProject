import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from "../App";
import NetworkStatus from "../Pages/Network";
import WifiConfig from "../Pages/WifiConfig";
import IPConfig from "../Pages/IPConfig";
import HealthMonitor from "../Pages/HealthMonitoring";
import PortConfig from "../Pages/PortConfig";
import AdminConfig from "../Pages/AdminConfig";
import Login from "../Auth/Login";
import MQTTConn from "../Pages/MQTTConn";
import GatewayProtocols from "../Pages/GatewayProtocol";
import AddVariable from "../Pages/AddVariable";
import Tags from "../Pages/Tags";
import FormulaBuilder from "../Pages/FormulaPage";




const ProtectedRoute = ({ element }) => {
  // const isAuth = localStorage.getItem("isAuth") === "true";
  const isAuth = true;
  return isAuth ? element : <Navigate to="/login" />;
};


const PublicRoute = ({ element }) => {
  const isAuth = localStorage.getItem("isAuth") === "true";
  return isAuth ? <Navigate to="/" /> : element;
};


// Define your routes
const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRoute element={<App />} />, 
  },
  {
    path: "/",
    element: <ProtectedRoute element={<App />} />, 
    children: [
      {
        path: "/",
        element: <NetworkStatus />,
      },
      {
        path: "/wifi-config",
        element: <WifiConfig />,
      },
      {
        path: "/ip-config",
        element: <IPConfig />,
      },
      {
        path: "/health-monitor",
        element: <HealthMonitor />,
      },
      {
        path: "/port-config",
        element: <PortConfig />,
      },
      {
        path: "/mqtt-connection",
        element: <MQTTConn />,
      },
      {
        path: "/gateway-protocols",
        element: <GatewayProtocols />,
      },
      {
        path: "/admin-config",
        element: <AdminConfig />,
      },{
        path:"/tags/:serverName",
        element:<Tags/>
      },{
        path:"/AddVariable/:serverName",
        element:<AddVariable/>
      },{
        path:"/FormulaBuilder/:serverName",
        element:<FormulaBuilder/>
      }
    ],
  },
]);

const MainRoutes = () => {
  return <RouterProvider router={router} />;
};

export default MainRoutes;