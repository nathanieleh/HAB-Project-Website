import Image from "next/image";
import Navbar from "../components/Navbar";
import Graph from "../components/Graph";
import TopBar from "../components/TopBar";

export default function Home() {
  // eventually change to fetch from backend
  let forecasts = [
    { day: 'Sun', value: 70 },
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 75 },
    { day: 'Thu', value: 80 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 85 }
  ]
  return (
    <main className="min-h-screen h-auto bg-[url(/background.png)] bg-cover bg-no-repeat bg-fixed">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mt-[10vh] text-secondary">
        Projected Bioluminescence Forecasts
      </h1>
      <h2 className="text-center text-white mt-[5vh]">
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
      <div className="flex items-center justify-center ">
        <TopBar forecasts={forecasts} />
      </div>
      <Graph />
    </main>
  );
}
