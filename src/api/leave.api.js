import axiosInstance from "./axiosInstance";

export const requestLeaveApi = (data) => axiosInstance.post("/leaves", data);
export const getMyLeavesApi = () => axiosInstance.get("/leaves/my");
export const getAllLeavesApi = () => axiosInstance.get("/leaves");
export const updateLeaveStatusApi = (id, status) => axiosInstance.patch(`/leaves/${id}`, { status });