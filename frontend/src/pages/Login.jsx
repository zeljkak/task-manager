import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { login } from "../services/authService.js";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
      e.preventDefault();

      setLoading(true);
      setError("");
      setMessage("");

      try {
          const res = await login({
              email,
              password,
          });

          setMessage(res.data?.message || "Login successful");

          if (res.data?.accessToken) {
              localStorage.setItem("accessToken", "Bearer " + res.data.accessToken);
              const decoded = jwtDecode(res.data.accessToken);
              localStorage.setItem("userId", decoded.sub);
          }

          setTimeout(() => {
              navigate("/");
          }, 1000);
      } catch (err) {
          setError(
          err.response?.data?.error ||
              "Invalid email or password"
          );
      } finally {
          setLoading(false);
      }
  };

  return (
      <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p style={{ color: "green", marginTop: "10px" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
}