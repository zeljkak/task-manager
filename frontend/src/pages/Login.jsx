import {useState} from "react";
import {Link, Navigate, useNavigate} from "react-router-dom";
import {login} from "../services/authService.js";
import {useAuth} from "../context/useAuth.js";

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
          await loginUser();

          navigate("/");
      } catch (err) {
          setError(
          err.response?.data?.error ||
              "Something went wrong"
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
          <label htmlFor={"login-email"} className={"hidden"}>Email</label>
          <input type="email" value={email} id={"login-email"} required className={"form-input"}
            placeholder={"Enter your email"}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={"form-div"}>
          <label htmlFor={"login-password"} className={"hidden"}>Password</label>
          <input type="password" value={password} id={"login-password"} required className={"form-input"}
            placeholder={"Enter your password"}
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
        <>
          <p className={"error"}>
            {error}
          </p>

          {error === "Please verify your email first" && (
            <div className={"redirect-link-div"}>
              <p>Your account is not verified. <Link to="/verification">Request verification link here</Link></p>
            </div>
          )}

          {error === "Account deleted, restore available" && (
            <div className={"redirect-link-div"}>
                <p>Your account was deactivated. <Link to="/restore-request">Restore account here</Link></p>
            </div>
          )}
        </>
      )}

      <div className={"redirect-link-div"}>
          <p>Forgot your password? <Link to="/forgot-password">Reset password here</Link></p>
      </div>

      <div className={"redirect-link-div"}>
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>

    </div>
  );
}