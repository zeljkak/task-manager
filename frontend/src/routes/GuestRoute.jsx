import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <p className={"loading"}>Loading app...</p>
      </div>
    );
  }

  // If the user is logged in, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, render the login page
  return <Outlet />;
}