import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner"><p className={"loading"}>Loading task details...</p></div>;
  }

  // If the user is logged in, redirect them away from /login
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, render the login page
  return <Outlet />;
}