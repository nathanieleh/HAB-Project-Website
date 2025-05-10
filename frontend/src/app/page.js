import Image from "next/image";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import Today from "../components/Today";
import Graph from "../components/Graph";

export default async function Home() {
  // TODO: Fetch forecasts from backend
  //let forecasts = await getForecasts();
  let forecasts = [
    { "day": "Sunday", "value": 760 },
    { "day": "Monday", "value": 260 },
    { "day": "Tuesday", "value": 10 },
    { "day": "Wednesday", "value": 60 },
    { "day": "Thursday", "value": 400 },
    { "day": "Friday", "value": 560 },
    { "day": "Saturday", "value": 920 }
  ]


  return (
    <main className="min-h-screen h-auto bg-[url(/background.png)] bg-cover bg-no-repeat bg-fixed items-center">
      <Navbar />
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
        7-Day Predictions: {
          (() => {
            const today = new Date();
            const sunday = new Date(today);
            const saturday = new Date(today);
            sunday.setDate(today.getDate() - today.getDay());
            saturday.setDate(today.getDate() + (6 - today.getDay()));
      
            const format = (date) =>
              date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
      
            return `Sun, ${format(sunday)} – Sat, ${format(saturday)}`;
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
    </main>
  );
}
