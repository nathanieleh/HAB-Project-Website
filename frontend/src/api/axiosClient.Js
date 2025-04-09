import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
