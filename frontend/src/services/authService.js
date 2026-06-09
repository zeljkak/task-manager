import axios from "axios";

export const resetPassword = (token, data) => {
  return axios.post(
    `http://localhost:5000/auth/reset-password/${token}`,
    data
  );
};