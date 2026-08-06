import axiosInstance from "./axiosInstance";

export const assignTaskApi = (data) => axiosInstance.post("/tasks", data);
export const getMyTasksApi = () => axiosInstance.get("/tasks/my");
export const getAllTasksApi = () => axiosInstance.get("/tasks");
export const updateTaskStatusApi = (id, status) => axiosInstance.patch(`/tasks/${id}`, { status });