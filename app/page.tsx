import Demo from "../shared/ui/marketing/Demo";
import Features from "../shared/ui/marketing/Features";
import Hero from "../shared/ui/marketing/Hero";
import Pricing from "../shared/ui/marketing/Pricing";
import Footer from "@/shared/ui/layout/Footer";
import MarketingNavbar from "@/shared/ui/layout/MarketingNavbar";

export default async function Home() {
  return (
    <>
      <MarketingNavbar />
      <main className="relative">
        <section className="max-w-4xl mx-auto">
          <Hero />
          <Features />
          <Pricing />
          <Demo />
        </section>
      </main>
      <Footer />
    </>
  );
}
