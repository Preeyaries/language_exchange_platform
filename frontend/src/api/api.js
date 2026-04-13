import axios from "axios";
const API = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
=======
   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
>>>>>>> f1d72f41640732fad97e6a8aa3b4f959781ba8c1
});
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
export default API;