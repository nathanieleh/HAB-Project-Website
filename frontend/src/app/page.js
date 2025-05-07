import Image from "next/image";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <main className="h-[100vh] bg-[url(/background.png)] bg-cover bg-no-repeat">
      <Navbar />

      <h1 className="text-4xl font-bold text-center mt-[10vh] text-secondary">
        Projected Bioluminescence Forecasts
      </h1>
    </main>
  );
}
