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
        setTimeout(() => {
              navigate("/login");
          }, 3000);
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
      }, 3000);
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
      <div className={"centered-page"}>
        <p>Checking reset link...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={"centered-page"}>
        <h2>Reset Password</h2>
        <p className={"error"}>{error}</p>
      </div>
    );
  }

  return (
    <div className={"centered-page"}>
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

      {message && <p className={"message"}>{message}</p>}
      {error && <p className={"error"}>{error}</p>}
    </div>
  );
}