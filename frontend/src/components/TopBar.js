"use client";

import { useEffect } from "react";

/**
 * @param {JSON} forecasts - List of JSON object of forecasts ex:[{"day": "Sunday", "value": 760}]
 * @param {string} className - tailwind CSS for entire component styling
 * @returns Component displaying each day's numeric forecast
 */
export default function TopBar({ forecasts, className }) {
    // Function to scroll the top bar to today, if on phone
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth <= 768) {
          const today = new Date().getDay(); // 0 = Sunday
          const element = document.querySelector(`[data-day="${today}"]`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          }
        }
        alert("⚠️ Warning: This site currently serves outdated data. We are working to resolve this issue. ⚠️");
      }, []);
    
    const today = new Date();
    const beginningOfWeek = new Date(today);
    const endOfWeek = new Date(today);

    // Set to the beginning of the week (Sunday)
    beginningOfWeek.setDate(today.getDate() - today.getDay());

    // Set to the end of the week (Saturday)
    endOfWeek.setDate(beginningOfWeek.getDate() + 6);

    const tempWeekDate = new Date(beginningOfWeek);

    return (
        <div className={className}>
            <div className="flex items-center justify-between w-[95vw] lg:w-[90vw] py-4 lg:p-4 bg-primary/40 text-white rounded-xl divide-x overflow-auto">
                {forecasts.map((item, index) => {
                    const weekStart = new Date(beginningOfWeek);
                    weekStart.setDate(beginningOfWeek.getDate() + index * 7);

                    const weekEnd = new Date(endOfWeek);
                    weekEnd.setDate(endOfWeek.getDate() + index * 7);

                    return (
                        <div key={index} data-day={index} className="flex-1 px-4 text-center">
                            <p className="text-xs lg:text-lg">{weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}</p>
                            <div className="text-sm font-bold lg:text-xl">{item.Likeliness}</div>
                            <div className="text-xs lg:text-lg">{`Week ${index + 1}`}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}