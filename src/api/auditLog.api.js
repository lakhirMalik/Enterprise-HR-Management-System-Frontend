import axiosInstance from "./axiosInstance.js";

export const getAuditLogsApi = () => axiosInstance.get("/audit-logs");