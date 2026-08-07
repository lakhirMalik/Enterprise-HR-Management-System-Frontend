import axiosInstance from "./axiosInstance";

export const getJobsApi = () => axiosInstance.get("/jobs");
export const getJobByIdApi = (id) => axiosInstance.get(`/jobs/${id}`);
export const createJobApi = (data) => axiosInstance.post("/jobs", data);
export const closeJobApi = (id) => axiosInstance.patch(`/jobs/${id}/close`);

export const applyToJobApi = (id, formData) =>
  axiosInstance.post(`/jobs/${id}/apply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyApplicationsApi = () => axiosInstance.get("/jobs/applications/my");
export const getJobApplicationsApi = (id) => axiosInstance.get(`/jobs/${id}/applications`);
export const updateApplicationStatusApi = (id, status) => axiosInstance.patch(`/jobs/applications/${id}`, { status });