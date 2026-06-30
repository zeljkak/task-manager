import {useState, useEffect} from 'react'
import {Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RestoreAccount from "./pages/RestoreAccount";
import Profile from "./pages/Profile.jsx";
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Projects from "./pages/Projects.jsx";

function App() {

  useEffect(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/projects" element={<Projects />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/restore-account/:token" element={<RestoreAccount />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default App
