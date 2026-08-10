import axiosInstance from "./axiosInstance";

export const changePasswordApi = (currentPassword, newPassword) =>
  axiosInstance.post("/auth/change-password", { currentPassword, newPassword });
export const setup2FAApi = () => axiosInstance.post("/auth/2fa/setup");
export const verify2FAApi = (token) => axiosInstance.post("/auth/2fa/verify", { token });
export const disable2FAApi = () => axiosInstance.post("/auth/2fa/disable");
export const getSessionsApi = () => axiosInstance.get("/auth/sessions");
export const revokeSessionApi = (id) => axiosInstance.delete(`/auth/sessions/${id}`);
export const revokeAllSessionsApi = () => axiosInstance.delete("/auth/sessions");
export const updateProfileApi = (data) => axiosInstance.patch("/auth/profile", data);
export const setup2FAEmailApi = () => axiosInstance.post("/auth/2fa/setup-email");
export const verify2FAEmailApi = (code) => axiosInstance.post("/auth/2fa/verify-email", { code });