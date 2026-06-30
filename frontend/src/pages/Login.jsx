import {useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {login} from "../services/authService.js";

export default function Login() {
  if (localStorage.getItem("accessToken")) {
      return <Navigate to="/" replace />
  }

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
      <div className={"centered-page"}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div className={"form-div"}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={"form-input"}
          />
        </div>

        <div className={"form-div"}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={"form-input"}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p className={"message"}>
          {message}
        </p>
      )}

      {error && (
        <p className={"error"}>
          {error}
        </p>
      )}
    </div>
  );
}