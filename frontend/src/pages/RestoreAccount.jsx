import {useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restoreAccount } from "../services/userService.js";

export default function RestoreAccount() {
  const { token } = useParams();
  const navigate = useNavigate();

  const ran = useRef(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const restore = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await restoreAccount(token);
            setMessage(res.data?.message || "Account restored successfully");
            setTimeout(()=> {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired token");
        } finally {
            setLoading(false);
        }
    };
    restore();
  }, [token, navigate]);

  return (
      <div className={"centered-page"}>
      <h2>Restoring Account</h2>

      {loading && <p>Restoring your account...</p>}
      {message && <p className={"message"}>{message}</p>}
      {error && <p className={"error"}>{error}</p>}
    </div>
  );
}