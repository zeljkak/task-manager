import {useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {login} from "../services/authService.js";
import {useAuth} from "../context/AuthContext.jsx";

export default function Login() {
  const {user, loginUser} = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

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
          loginUser();

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
          <label htmlFor={"login-email"}>Email</label>
          <input type="email" value={email} id={"login-email"} required className={"form-input"}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={"form-div"}>
          <label htmlFor={"login-password"}>Password</label>
          <input type="password" value={password} id={"login-password"} required className={"form-input"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
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