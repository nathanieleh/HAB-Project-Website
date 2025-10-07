"use client";

import {
  Line,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/**
 * @param {JSON} forecasts - List of JSON object of forecasts ex:[{ "Bloom_type": "Bioluminescent", "day": "Tuesday", "Date": "2025-06-03", "CI": 25.33333333333333, "Likeliness": "Unlikely" }]
 * @param {string} className - tailwind CSS for entire component styling
 * @returns Component displaying a line graph of the 3 week forecast
 */
export default function Graph({ forecasts, className }) {
  forecasts = forecasts.map((item, index) => ({
    week: "Week " + (index + 1),
    value: item.Likeliness === "Likely" ? 1 : 0,
    confidence: item.CI.toFixed(2),
  }))

  const yLabels = ["Unlikely", "Likely"];

  const getColor = (forecast) => (forecast ? "bg-green-500" : "bg-red-500");

  return (
    <div className={className}>
      <div
        className="w-[80vw] md:w-[50vw] p-6 rounded-xl bg-primary/40"
      >
        <h3 className="text-white text-lg">3 Weeks Forecast Confidence</h3>
        <ResponsiveContainer width="100%" height={226}>
          <div className="flex flex-row gap-6 items-start justify-center">
            {forecasts.map((d, i) => (
              <div key={i} className="flex flex-col items-center h-60">
                {/* Confidence Bar */}
                <div className="flex flex-col-reverse h-full w-20 bg-gray-500 overflow-hidden rounded-full">
                  <div
                    className={`${getColor(d.value)} w-full`}
                    style={{ height: `${d.confidence}%` }}
                  ></div>
                </div>

                {/* Emoji + Week */}
                <div className="text-sm mb-1 text-white">
                  {d.value ? "✅" : "❌"} {d.week}
                </div>

                {/* Confidence % */}
                <div className="text-xs mt-1 text-white">
                  {d.confidence}%
                </div>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  );
}