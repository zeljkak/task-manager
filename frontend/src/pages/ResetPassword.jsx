import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== passwordRepeated) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, {
        password,
        passwordRepeated: passwordRepeated,
      });

      setMessage("Password updated successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    }

    setLoading(false);
  };

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

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}