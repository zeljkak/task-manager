import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { checkTokenForEmailVerification, verifyEmail } from "../services/authService.js";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const ran = useRef(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const validateToken = async () => {
      setLoading(true);
      setError("");

      try {
        await checkTokenForEmailVerification(token);
        setIsValidToken(true);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired verification token");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError("");
    setMessage("");

    try {
      const res = await verifyEmail(token);
      setMessage(res.data?.message || "Email verified successfully");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="centered-page">
      <h2>Email Verification</h2>

      {loading && (
        <div className="loading-spinner-container">
          <p>Checking token validity...</p>
        </div>
      )}

      {!loading && error && !isValidToken && (
        <>
          <div className="error-message">
            <p className="error">{error}</p>
          </div><br/>
          <div className={"redirect-link-div"}>
            <Link to="/verification">Request a new link</Link>
          </div>
          <div className="redirect-link-div">
            <Link to="/login">Back to Login</Link>
          </div>
        </>
      )}

      {!loading && isValidToken && !message && (
        <form onSubmit={handleVerify}>
          <p className="message centered-text">Your token is valid.</p>
          <p className="centered-text">Click below to confirm and verify your email address.</p>
          <button type="submit" disabled={verifying}>
            {verifying ? "Verifying..." : "Verify"}
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