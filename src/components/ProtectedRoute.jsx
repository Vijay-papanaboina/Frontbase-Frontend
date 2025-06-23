import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // User not authenticated, redirect to login page
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
