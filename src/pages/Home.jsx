import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5ec]">
      <Navbar />
      <Hero />
      <HowItWorks />
    </div>
  );
}