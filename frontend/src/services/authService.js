import api from "../api/axios";

export const register = (data) => {
  return api.post(
    `/auth/register`,
    data
  );
};

export const forgotPassword = (email) => {
  return api.post(
    `/auth/forgot-password`,
      email
  );
};

export const checkTokenForResetPassword = (token) => {
  return api.get(
    `/auth/reset-password/${token}`
  );
};

export const resetPassword = (token, data) => {
  return api.post(
    `/auth/reset-password/${token}`,
    data
  );
};

export const requestEmailVerification = (email) => {
  return api.post(
    `/auth/request-email-verification`,
      email
  );
};

export const checkTokenForEmailVerification = (token) => {
  return api.get(
    `/auth/verify-email/${token}`
  );
};

export const verifyEmail = (token) => {
  return api.post(
    `/auth/verify-email/${token}`
  );
};

export const login = (data) => {
  return api.post(
    `/auth/login`,
    data
  );
}

export const logout = () => {
  return api.post(
    `/auth/logout`
  );
}