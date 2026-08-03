import axiosInstance from "./axiosInstance";

export const registerApi = (data) => axiosInstance.post("/auth/Register", data);
export const loginApi = (data) => axiosInstance.post("/auth/login", data);
export const logoutApi = () => axiosInstance.post("/auth/logout");
export const meApi = () => axiosInstance.get("/auth/me");
export const refreshApi = () => axiosInstance.post("/auth/refresh")