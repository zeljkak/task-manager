import {useEffect, useState, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {resetPassword, checkTokenForResetPassword} from "../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const ran = useRef(false);

  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [tokenValid, setTokenValid] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const validateToken = async () => {
      setLoading(true);
      setError("");

      try {
        await checkTokenForResetPassword(token);
        setTokenValid(true);
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || "Invalid or expired token");
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== passwordRepeated) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const res = await resetPassword(token, {
        password,
        passwordRepeated,
      });

      setMessage(res.data?.message || "Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={"centered-page"}>
      <h2>Reset Password</h2>

      {loading && (
        <div className="loading-spinner-container">
          <p>Checking reset link...</p>
        </div>
      )}

      {!loading && error && !tokenValid && (
        <>
          <div className="error-message">
            <p className="error">{error}</p>
          </div><br/>
          <div className={"redirect-link-div"}>
            <Link to="/forgot-password">Request a new link</Link>
          </div>
          <div className="redirect-link-div">
            <Link to="/login">Back to Login</Link>
          </div>
        </>
      )}

      {!loading && tokenValid && !message && (
        <form onSubmit={handleSubmit}>
          <div className="form-div">
            <div className="form-element">
              <label htmlFor="new-password" className="hidden">New Password</label>
              <input id="new-password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password" required className="form-input"
              />
            </div>

            <div className="form-element">
              <label htmlFor="repeat-password" className="hidden">Repeat Password</label>
              <input id="repeat-password" type="password" value={passwordRepeated}
                onChange={(e) => setPasswordRepeated(e.target.value)}
                placeholder="Repeat new password" required className="form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Reset"}
          </button>

          {error && <p className="error">{error}</p>}
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