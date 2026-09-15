import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <p className={"loading"}>Loading app...</p>
      </div>
    );
  }

  // If the user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render content
  return <Outlet />;
}