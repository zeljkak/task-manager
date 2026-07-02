import api from "../api/axios";

export const getPriorities = () => {
  return api.get(
    `/priorities`
  );
};