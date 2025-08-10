import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import Demo from "./components/pages/Demo";
import Features from "./components/pages/Features";
import Hero from "./components/pages/Hero";
import Pricing from "./components/pages/Pricing";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/redirecting");

  return (
    <>
      <Navbar />
      <main className="relative">
        <section className="max-w-4xl mx-auto">
          <Hero />
          {/* <Problem /> */}
          {/* <Benefits /> */}
          <Features />
          <Pricing />
          <Demo />
        </section>
      </main>
      <Footer />
    </>
  );
}
