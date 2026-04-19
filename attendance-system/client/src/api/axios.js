// Axios instance placeholder
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(function(config) {
  var token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

api.interceptors.response.use(
  function(res) { return res; },
  function(err) {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export { api };
export default api;