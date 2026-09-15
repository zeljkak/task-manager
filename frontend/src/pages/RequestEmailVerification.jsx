import { useState } from "react";
import { Link } from "react-router-dom";
import { requestEmailVerification } from "../services/authService.js";

export default function RequestEmailVerification() {
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
      const res = await requestEmailVerification({ email });
      setMessage(
        res.data?.message ||
          "If an account with this email exists, a verification link was sent."
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
      <h2>Request Email Verification</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-div">
          <label htmlFor="verify-email" className="hidden">Email</label>
            <input id="verify-email" type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email" className="form-input"
            />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>

        {message && <p className="message centerd-text">{message}</p>}
        {error && <p className="error centered-text">{error}</p>}

        <div className="redirect-link-div">
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}