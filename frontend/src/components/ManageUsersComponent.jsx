import {useEffect, useState} from "react";
import {updateUser} from "../services/adminService.js";
import {getRoles} from "../services/roleService.js";

function ManageUsersComponent ({ users = [], onCancel }) {
  const [usersList, setUsersList] = useState(users);
  const [roles, setRoles] = useState([]);
  const [pendingRoleChanges, setPendingRoleChanges] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    setUsersList(users);
  }, [users]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data.roles || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load roles.");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleRoleSelect = (userId, newRoleName) => {
    setPendingRoleChanges((prev) => ({
      ...prev,
      [userId]: newRoleName,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const changedUserIds = Object.keys(pendingRoleChanges);
    if (changedUserIds.length === 0) {
      setMessage("No role changes to save.");
      return;
    }

    try {
      await Promise.all(
        changedUserIds.map((uId) =>
          updateUser(uId, { roleName: pendingRoleChanges[uId] })
        )
      );

      // locally update the table
      setUsersList((prevUsers) =>
        prevUsers.map((u) => {
          const newRoleName = pendingRoleChanges[u.id];
          if (!newRoleName) return u;

          const updatedRoleObj = roles.find((r) => r.roleName === newRoleName);
          return {
            ...u,
            roleId: updatedRoleObj ? updatedRoleObj.id : u.roleId,
          };
        })
      );

      setMessage("User roles updated successfully!");
      setPendingRoleChanges({});
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to update user roles.");
    }
  };

  return (
    <div id="user-management-div">
        <h5>Manage Users</h5>
        <div className="table-div">
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Verified</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Active</th>
                    </tr>
                </thead>
                <tbody>
                    {usersList.map((u) => {
                        const currentUserId = u.id;
                        // find role name by role id returned from user fetch
                        const initialRoleObj = roles.find((r) => r.id === u.roleId);
                        const initialRoleName = initialRoleObj?.roleName || "";
                        const selectedRoleName = pendingRoleChanges[currentUserId] ?? initialRoleName;
                        return (
                            <tr key={currentUserId}>
                                <td style={{ color: u.isDeleted ? "red" : "inherit" }}>{u.firstName} {u.lastName}</td>
                                <td>{u.email}</td>
                                <td>{u.emailVerified ? "Yes" : "No"}</td>
                                <td>
                                    {loadingRoles ? (
                                        <span>Loading roles...</span>
                                    ) : (
                                        <select value={selectedRoleName} id={`select-row-${currentUserId}`}
                                            className={"table-select"}
                                            onChange={(e) =>
                                                handleRoleSelect(currentUserId, e.target.value)}
                                        >
                                          {roles.map((r) => (
                                            <option key={r.id} value={r.roleName}>
                                              {capitalize(r.roleName)}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString("en-GB").replaceAll("/", ".").concat(".")}</td>
                                <td>{u.isDeleted ? "No" : "Yes"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <div className={"user-management-inline-div"}>
          {message && <p className="message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className={"user-management-inline-div"}>
          <button type="button" onClick={handleSubmit}>Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
    </div>

  );
}

export default ManageUsersComponent;