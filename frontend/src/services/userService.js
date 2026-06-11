import axios from "axios";

export const restoreAccount = (token) => {
  return axios.get(
    `http://localhost:5000/users/restore/${token}`
  );
};