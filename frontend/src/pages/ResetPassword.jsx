import {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword, checkTokenForResetPassword } from "../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [tokenValid, setTokenValid] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      try {
        await checkTokenForResetPassword(token);
        setTokenValid(true);
      } catch (err) {
        setError(
          err.response?.data?.error || "Invalid or expired token"
        );
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
      await resetPassword(token, {
        password,
        passwordRepeated,
      });

      setMessage("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "400px", margin: "50px auto" }}>
        <p>Checking reset link...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={{ maxWidth: "400px", margin: "50px auto" }}>
        <h2>Reset Password</h2>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label>Repeat Password</label>
          <input
            type="password"
            value={passwordRepeated}
            onChange={(e) => setPasswordRepeated(e.target.value)}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Reset Password"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}