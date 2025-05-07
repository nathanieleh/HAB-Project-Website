import Today from "../components/Today";
import Graph from "../components/Graph";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

// Fetch forecasts from backend
async function getForecasts() {
  let forecasts;;
  fetch("/dummy_data.json")
    .then((res) => res.json())
    .then((json) => forecasts = json);
  return forecasts;
}

export default async function Home() {
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
      <Today forecasts={forecasts}/>
      <Graph forecasts={forecasts}/>
    </main>
  );
}
