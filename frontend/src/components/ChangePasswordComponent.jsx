import { useState } from "react";
import {changePassword} from "../services/userService.js";

function ChangePasswordComponent({ onCancel }) {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "" , confirmPassword: ""});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match.");
        return;
    }

    try {
      await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
      });
      setMessage("Password updated successfully!");
      setError(null);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <form id={"password-change-form"} onSubmit={handleSubmit}>
      <h5>Password Change</h5>
      <div className={"password-change-inline-div"}>
        <label htmlFor="current-password" className="hidden">Enter your current password:</label>
        <input id={"current-password"} type="password" className="form-input"
          placeholder="Current Password" value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
        />
      </div>
      <div className={"password-change-inline-div"}>
        <label htmlFor={"new-password"} className="hidden">Enter your new password:</label>
        <input id={"new-password"} type="password" className="form-input"
          placeholder="New Password" value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        />
      </div>
      <div className={"password-change-inline-div"}>
        <label htmlFor={"confirm-password"} className="hidden">Confirm your new password:</label>
        <input id={"confirm-password"} type="password" className="form-input"
          placeholder="Confirm Password" value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
      </div>
      <div className={"password-change-inline-div"}>
        {message && <p className="message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className={"password-change-inline-div"}>
        <button type="submit">Update Password</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default ChangePasswordComponent;
