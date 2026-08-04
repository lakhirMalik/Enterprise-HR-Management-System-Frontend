import axiosInstance from "./axiosInstance";

export const getMyNotificationsApi = () => axiosInstance.get("/notifications");
export const markAsReadApi = (id) => axiosInstance.patch(`/notifications/${id}/read`);