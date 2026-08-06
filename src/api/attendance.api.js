import axiosInstance from "./axiosInstance";

export const checkInApi = () => axiosInstance.post("/attendance/check-in");
export const checkOutApi = () => axiosInstance.post("/attendance/check-out");
export const getMyAttendanceApi = () => axiosInstance.get("/attendance/my");
export const getAllAttendanceApi = () => axiosInstance.get("/attendance");