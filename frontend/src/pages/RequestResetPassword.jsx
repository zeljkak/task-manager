import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService.js";

export default function RequestResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await forgotPassword({ email });
      setMessage(
        res.data?.message ||
          "If an account with this email exists, a password reset link was sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred while sending the request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-page">
      <h2>Reset Password Request</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-div">
          <label htmlFor="reset-email" className="hidden">Email</label>
          <input id="reset-email" type="email" value={email} className="form-input"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email" required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>

        {message && <p className="message centered-text">{message}</p>}
        {error && <p className="error centered-text">{error}</p>}
      </form>

      <div className="redirect-link-div">
        <p>Remembered your password? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}