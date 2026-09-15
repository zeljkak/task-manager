import { useEffect, useState } from "react";
import {createPortal} from "react-dom";
import {Link, useNavigate} from "react-router-dom";
import {deleteAccount} from "../services/userService.js";
import ChangePasswordComponent from "../components/ChangePasswordComponent.jsx";
import {useAuth} from "../context/useAuth.js";

export default function Settings() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleDeactivateAccount = async () => {
    try {
      setLoading(true);
      await deleteAccount();
      await logoutUser();
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to deactivate account.");
      setLoading(false);
      setShowDeactivateModal(false);
    }
  };

  return (
    <div id="settings-div">
      <h2>Settings</h2>
      <hr />

      {loading ? (
        <div className="spinner">
          <p className="loading">Loading settings...</p>
        </div>
      ) : (
        <>
          {!showChangePassword ? (
            <button onClick={() => setShowChangePassword(true)}>
              Change Password
            </button>
          ) : (
            <ChangePasswordComponent onCancel={() => setShowChangePassword(false)} />
          )}

          <button onClick={() => setShowDeactivateModal(true)}>
            Deactivate Account
          </button>

          {message && <p className="message">{message}</p>}
          {error && (
            <div className="error-message not-centered-text" style={{height: "initial", padding: "6px"}}>
              <p className="error">{error}</p>
            </div>
          )}
        </>
      )}

      {showDeactivateModal &&
        createPortal(
          <div className="confirmation-overlay">
            <div className="confirmation-div">
              <p>Are you sure you want to deactivate your account?</p>
              <div className="confirmation-actions">
                <button type="button" className="positive"
                  onClick={handleDeactivateAccount}
                >
                  Yes
                </button>
                <button type="button" className="negative"
                  onClick={() => setShowDeactivateModal(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>,
          document.getElementById("content") || document.body
        )}

    </div>
  );
}