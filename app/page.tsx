import React from "react";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Benefits from "./components/pages/Benefits";
import Demo from "./components/pages/Demo";
import Features from "./components/pages/Features";
import Hero from "./components/pages/Hero";
import Pricing from "./components/pages/Pricing";
import Problem from "./components/pages/Problem";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <section className="max-w-4xl mx-auto">
        <Hero />
        {/* <Problem /> */}
        {/* <Benefits /> */}
        <Features />
        <Pricing />
        <Demo />
      </section>
      <Footer />
    </main>
  );
}
