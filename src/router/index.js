import { createBrowserRouter, Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Simple login check using localStorage
const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />, // Default: go to login
  },
  {
    path: "/home",
    element: isAuthenticated() ? <Home /> : <Navigate to="/login" />, // Protected route
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
