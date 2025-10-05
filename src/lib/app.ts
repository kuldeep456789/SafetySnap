import axios from "axios";

// 👇 Base URL of your Flask backend (Render)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// ✅ Example: test connection to backend
export const testConnection = async () => {
  const response = await API.get("/");
  return response.data;
};

// ✅ Example: upload image for detection
export const detectObjects = async (formData: FormData) => {
  const response = await API.post("/detect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export default API;
