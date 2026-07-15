import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getProfile} from "../services/userService.js";
import ProfileComponent from "../components/ProfileComponent.jsx";

export default function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [user, setUser] = useState([]);

  useEffect(() => {
    getProfile()
        .then(data => setUser(data.data.user))
        .catch(err => console.error(err));
  }, []);

  return (
    <>
      <h2>Profile</h2><hr />
      <ProfileComponent key={user.id} user={user} />

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
    </>
  );
}