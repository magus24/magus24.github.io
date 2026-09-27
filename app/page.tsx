import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Problem from "@/app/components/Problem";
import Approach from "@/app/components/Approach";
import EventCatalog from "@/app/components/EventCatalog";
import Eda from "@/app/components/Eda";
import Results from "@/app/components/Results";
import LiveDemo from "@/app/components/LiveDemo";
import Report from "@/app/components/Report";
import Team from "@/app/components/Team";
import Links from "@/app/components/Links";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <Problem />
        <Approach />
        <EventCatalog />
        <Eda />
        <Results />
        <LiveDemo />
        <Report />
        <Team />
        <Links />
      </main>
      <Footer />
    </>
  );
}