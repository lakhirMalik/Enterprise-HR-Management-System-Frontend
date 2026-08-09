import axiosInstance from "./axiosInstance";

export const getEmployeesApi = () => axiosInstance.get("/employees");
export const getEmployeeByIdApi = (id) => axiosInstance.get(`/employees/${id}`);
export const createEmployeeApi = (data) => axiosInstance.post("/employees", data);
export const updateEmployeeApi = (id, data) => axiosInstance.patch(`/employees/${id}`, data);
export const deleteEmployeeApi = (id) => axiosInstance.delete(`/employees/${id}`);
export const getSalaryApi = (id) => axiosInstance.get(`/employees/${id}/salary`);
export const updateSalaryApi = (id, salary) => axiosInstance.patch(`/employees/${id}/salary`, { salary });
export const getUnlinkedUsersApi = () => axiosInstance.get("/employees/unlinked-users");
export const onboardEmployeeApi = (data) => axiosInstance.post("/employees/onboard", data);