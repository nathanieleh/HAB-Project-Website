import React, { useState } from "react";
import { submitRawData } from "../api/index";

const SubmitPage = () => {
  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setPredictions(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const result = await submitRawData(file);
      setPredictions(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to upload and fetch predictions.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Submit Raw Data (CSV)</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit" disabled={!file}>
          Submit
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {predictions && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Predictions:</h2>
          <ul>
            {predictions.map((p) => (
              <li key={p.date}>
                <strong>{p.date}</strong>: value={p.value.toFixed(2)} —{" "}
                {p.bloom_detected ? "🌊 Bloom Detected" : "✅ Safe"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubmitPage;
