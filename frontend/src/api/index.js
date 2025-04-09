import axiosClient from "./axiosClient";

export const submitRawData = async (csvFile) => {
  const formData = new FormData();
  formData.append("file", csvFile);

  const res = await axiosClient.post("/submit/data", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};



// GET /api/predictions/today
export const getTodayPrediction = async () => {
  const res = await axiosClient.get("/predictions/today");
  return res.data;
};

// GET /api/predictions/week
export const getWeeklyPredictions = async () => {
  const res = await axiosClient.get("/predictions/week");
  return res.data;
};

// GET /api/predictions/history?start={startDate}&end={endDate}
export const getHistoricalPredictions = async (startDate, endDate) => {
  const res = await axiosClient.get("/predictions/history", {
    params: { start: startDate, end: endDate },
  });
  return res.data;
};