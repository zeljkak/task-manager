import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService.js";
import { useAuth } from "../context/useAuth.js";

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

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

    if (password !== passwordRepeated) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await register({
        firstName,
        lastName,
        email,
        password,
        passwordRepeated,
      });

      setMessage(res.data?.message || "Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"centered-page"}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <div className={"form-div"}>
          <label htmlFor={"register-first-name"}>First Name</label>
          <input type="text" value={firstName} id={"register-first-name"}
            required className={"form-input"} placeholder={"Enter your first name"}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className={"form-div"}>
          <label htmlFor={"register-last-name"}>Last Name</label>
          <input type="text" value={lastName} id={"register-last-name"}
            required className={"form-input"} placeholder={"Enter your last name"}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className={"form-div"}>
          <label htmlFor={"register-email"}>Email</label>
          <input type="email" value={email} id={"register-email"}
            required className={"form-input"} placeholder={"Enter your email"}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={"form-div"}>
          <label htmlFor={"register-password"}>Password</label>
          <input type="password" value={password} id={"register-password"}
            required className={"form-input"} placeholder={"Create a password"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={"form-div"}>
          <label htmlFor={"register-password-repeated"}>Repeat Password</label>
          <input type="password" value={passwordRepeated} id={"register-password-repeated"}
            required className={"form-input"} placeholder={"Repeat the password"}
            onChange={(e) => setPasswordRepeated(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && <p className={"message"}>{message}</p>}

      {error && <p className={"error"}>{error}</p>}

      <div className={"redirect-link-div"}>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}