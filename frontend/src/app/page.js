import Image from "next/image";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

export default function Home() {
  // eventually change to fetch from backend
  let forecasts = [
    { day: 'Mon', value: 70 },
    { day: 'Tue', value: 60 },
    { day: 'Wed', value: 65 },
    { day: 'Thu', value: 75 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 90 },
    { day: 'Sun', value: 85 }
  ]
  return (
    <main>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <TopBar forecasts={forecasts} />
    </div>
    </main>
  );
}
