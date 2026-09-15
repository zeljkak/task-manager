import {useEffect} from 'react'
import {Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RequestRestoreAccount from "./pages/RequestRestoreAccount.jsx";
import RestoreAccount from "./pages/RestoreAccount";
import Profile from "./pages/Profile.jsx";
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Projects from "./pages/Projects.jsx";
import Task from "./pages/Task.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";
import RequestResetPassword from "./pages/RequestResetPassword.jsx";
import RequestEmailVerification from "./pages/RequestEmailVerification.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";

function App() {

  useEffect(() => {
      document.documentElement.setAttribute("data-bs-theme", "dark");
  }, []);

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks/:taskId" element={<Task />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restore-request" element={<RequestRestoreAccount />} />
        <Route path="/restore-account/:token" element={<RestoreAccount />} />
        <Route path="/forgot-password" element={<RequestResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verification" element={<RequestEmailVerification />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default App
