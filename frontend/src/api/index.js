import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});


//=======================================================
// // API calls to get all prediction data (unprocessed) from the backend
export const getAllPredictions = async () => {
  const res = await axiosClient.get("/predictions/all");
  return res.data;
}


// POST /api/submit/data
export const submitRawData = async (csvFile) => {
  const formData = new FormData();
  formData.append("file", csvFile);

  const res = await axiosClient.post("/submit/data", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
