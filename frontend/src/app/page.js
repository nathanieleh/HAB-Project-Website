import Image from "next/image";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import Today from "../components/Today";
import Graph from "../components/Graph";
import forecastdata from "../data/forecasts"
import './globals.css'


async function getForecastData() {

  try {
    const startTime = performance.now();
    
    // // Replace with your Google Drive file ID for the latest forecast
    // const FORECAST_FILE_ID = 'your-google-drive-file-id';
    
    // // Fetch from your backend proxy that handles Google Drive API authentication
    // const response = await fetch(`/api/forecast?fileId=${FORECAST_FILE_ID}`, {
    //   cache: 'no-store', // This ensures fresh data on every request
    //   method: 'GET',
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to fetch forecast data from Google Drive');
    // }
    
    // const data = await response.json();
    const data  = forecastdata;
    
    //const endTime = performance.now();
    //console.log(`Forecast data fetch from Google Drive took ${(endTime - startTime).toFixed(2)}ms`);

    // Validate data structure
    if (!Array.isArray(data)) {
      console.error('Invalid data structure: expected array, got:', typeof data);
      return defaultData;
    }

    if (data.length !== 3) {
      console.error('Invalid data length: expected 3 weeks, got:', data.length);
      return defaultData;
    }

    // Validate each week's data structure
    const isValidWeekData = (week) => {
      return (
        typeof week === 'object' &&
        week !== null &&
        typeof week.Bloom_type === 'string' &&
        typeof week.day === 'string' &&
        typeof week.Date === 'string' &&
        typeof week.CI === 'number' &&
        typeof week.Likeliness === 'string' &&
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(week.day)
      );
    };

    if (!data.every(isValidWeekData)) {
      console.error('Invalid week data structure in response');
      return defaultData;
    }

    return data;
  } catch (error) {
    console.error('Error fetching forecast data from Google Drive:', error);
    return defaultData;
  }
}

export default async function Home() {
  // Fetch the forecast data
  const forecasts = await getForecastData();

  return (
    <main className="min-h-screen h-auto bg-[url(/background.png)] bg-cover bg-no-repeat bg-fixed items-center">
      <Image
          src="/hknlogo.svg"
          className="pl-10 pt-8"
          alt="HKN Logo"
          width={180}
          height={50}
      />
      <h1 className="text-4xl font-bold text-center text-secondary shadow">
        Projected Bioluminescence Forecasts
      </h1>
      <div className="flex flex-row mt-[3vh] justify-center">
        <Image
          src="/location.svg"
          alt="Location Pin"
          width={25}
          height={25}
          className="mr-4"
        />
        <h2 className="text-xl text-white text-center">
          Scripps Pier, La Jolla
        </h2>
      </div>
      <h2 className="text-center text-white mt-[5vh] mb-4">
        3-Week Predictions: {
          (() => {
            const today = new Date();
            const firstWeek = new Date(today);
            const finalWeek = new Date(today);

            // Set to the nearest Tuesday
            firstWeek.setDate(today.getDate() - today.getDay() + 2);

            // Set to the Tuesday 2 weeks later
            finalWeek.setDate(firstWeek.getDate() + 14);

            const format = (date) =>
              date.toLocaleDateString("en-US", { month: "long", day: "numeric" });

            return `Tue, ${format(firstWeek)} – Tue, ${format(finalWeek)}`;
          })()
        }
      </h2>
      <div className="flex items-center justify-center mb-4">
        <TopBar forecasts={forecasts} className=""/>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center space-x-0 md:space-x-4 gap-y-4 md:gap-y-0">
        <Today forecasts={forecasts} className="md:self-start"/>
        <Graph forecasts={forecasts} className="mb-[5vh]"/>
      </div>


      <div className = "flex flex-col justify-center items-center">
        <h1 className="text-2xl text-center mt-[5vh]  text-secondary font-bold " >About</h1>
        <p className="text-center text-white opacity-80 mt-[5vh] mb-[5vh] max-w-2xl leading-loose">
          This project is a web application that provides a 7-day forecast of bioluminescence levels at Scripps Pier, La Jolla. The forecasts are based on data collected from various sources and are displayed in an easy-to-read format.
          The application features a top bar that shows the forecast for each day, a detailed view of today's forecast, and a graph that visualizes the data over the week. The goal of this project is to help users plan their visits to Scripps Pier based on the bioluminescence levels.
          
          The application is built using Next.js and Tailwind CSS, providing a responsive and user-friendly interface. The data is fetched from a backend server and displayed in real-time, ensuring that users have the most up-to-date information.
          The project is still in development, and future updates will include more features and improvements to the user experience. We welcome feedback and suggestions from users to help us make this application even better.  
          </p>
      </div>
    </main>
  );
}
