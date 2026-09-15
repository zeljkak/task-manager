import {useEffect, useState, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {checkTokenForRestore, restoreAccount} from "../services/userService.js";

export default function RestoreAccount() {
  const { token } = useParams();
  const navigate = useNavigate();

  const ran = useRef(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const validateToken = async () => {
      setLoading(true);
      setError("");

      try {
        await checkTokenForRestore(token);
        setIsValidToken(true);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired restore token");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleRestore = async (e) => {
    e.preventDefault();
    setRestoring(true);
    setError("");
    setMessage("");

    try {
      const res = await restoreAccount(token);
      setMessage(res.data?.message || "User account restored successfully");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restore account");
    } finally {
      setRestoring(false);
    }
  };

  return (
      <div className={"centered-page"}>
      <h2>Account Restoration</h2>

      {loading && (
          <div className="loading-spinner-container">
            <p>Checking token validity...</p>
          </div>
      )}

      {!loading && error && (
        <div className="error-message">
          <p className="error">{error}</p>
          <div className="redirect-link-div">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      )}

      {!loading && isValidToken && !message && (
        <form onSubmit={handleRestore}>
          <p className="message centered-text">Your token is valid.</p>
          <p className="centered-text">Would you like to restore your account?</p>
          <button type="submit" disabled={restoring}>
            {restoring ? "Restoring..." : "Restore"}
          </button>
        </form>
      )}

      {message && (
        <div>
          <p className="message">{message}</p>
          <p className="centered-text">Redirecting to login...</p>
        </div>
      )}
    </div>
  );
}