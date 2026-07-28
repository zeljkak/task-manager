import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/userService.js";
import ProfileComponent from "../components/ProfileComponent.jsx";

export default function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");

    getProfile()
      .then(data => {
        setUser(data.data.user);
      })
      .catch(err => {
        console.error("Failed to load profile:", err);
        setError(err.response?.data?.error || "Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div id="profile-info">
      <h2>Profile</h2>
      <hr />

      {loading ? (
        <div className="spinner">
          <p className="loading">Loading profile...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p className="error">{error}</p>
        </div>
      ) : (
        <>
          {user && <ProfileComponent key={user.id} user={user} />}

          {message && <p className="message">{message}</p>}
        </>
      )}
    </div>
  );
}