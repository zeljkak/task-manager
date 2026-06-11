import axios from "axios";

export const checkTokenForResetPassword = (token) => {
  return axios.get(
    `http://localhost:5000/auth/reset-password/${token}`
  );
};

export const resetPassword = (token, data) => {
  return axios.post(
    `http://localhost:5000/auth/reset-password/${token}`,
    data
  );
};

export const login = (data) => {
  return axios.post(
    `http://localhost:5000/auth/login`,
    data
  );
}