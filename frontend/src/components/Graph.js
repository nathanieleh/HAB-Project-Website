"use client";

/**
 * @param {JSON} forecasts - List of JSON object of forecasts ex:[{ "Bloom_type": "Bioluminescent", "day": "Tuesday", "Date": "2025-06-03", "CI": 25.33333333333333, "Likeliness": "Unlikely" }]
 * @param {string} className - tailwind CSS for entire component styling
 * @returns Component displaying a line graph of the 3 week forecast
 */
export default function Graph({ forecasts, className }) {
  forecasts = forecasts.map((item, index) => ({
    week: "Week " + (index + 1),
    direction: item.Likeliness === "Likely" ? "up" : "down",
    confidence: item.CI.toFixed(2)
  }));

  const getColor = (direction) =>
    direction === "up" ? "bg-[var(--color-secondary)]" : "bg-gray-500";

  return (
    <div className={className}>
      <div className="w-[80vw] md:w-[50vw] p-6 rounded-xl bg-primary/40">
        <h3 className="text-white text-lg text-center">3 Week Forecast Confidence</h3>

        {/* Chart container */}
        <div className="relative flex justify-center items-center h-90">
          {/* Baseline (0) */}
          <div className="absolute left-1/8 right-1/8 top-1/2 h-[2px] bg-white z-10"></div>

          {/* Bars */}
          <div className="flex flex-row justify-center gap-8 w-full">
            {forecasts.map((f, i) => (
              <div key={i} className="flex flex-col items-center w-20">
                <div className="relative h-64 w-16 bg-gray-700 rounded-full overflow-hidden">
                  {/* Bar fill */}
                  <div
                    className={`${getColor(f.direction)} absolute left-0 right-0`}
                    style={{
                      height: `${f.confidence / 2}%`, // half container represents 100
                      top: f.direction === "down" ? "50%" : "auto",
                      bottom: f.direction === "up" ? "50%" : "auto",
                    }}
                  />
                </div>

                {/* Labels */}
                <div className="absolute top-[82.5%] mt-2 flex flex-col items-center">
                  <div className="mt-2 text-white text-sm">{f.week}</div>
                  <div className="text-lg text-white font-bold">
                    {f.direction === "up" ? "Likely" : "Unlikely"}
                  </div>
                  <div className="text-white text-xs">{(f.direction === "up" ? 1 : -1) * f.confidence}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Axis labels */}
          <div className="absolute left-4 flex flex-col items-center text-xs text-white h-full justify-between">
            <span>Likely</span>
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
            <span>-50%</span>
            <span>-100%</span>
            <span>Unlikely</span>
          </div>
          <div className="absolute right-4 flex flex-col items-center text-xs text-white h-full justify-between">
            <span>Likely</span>
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
            <span>-50%</span>
            <span>-100%</span>
            <span>Unlikely</span>
          </div>
        </div>
      </div>
    </div>
  );
}