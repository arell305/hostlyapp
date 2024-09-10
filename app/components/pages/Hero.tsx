import Image from "next/image";
import { Button } from "../shared/Button";

const Hero = () => {
  return (
    <section id="home" className="flex flex-col md:flex-row ">
      <div className="flex text-center justify-center mt-10 flex-col md:w-1/2 md:ml-24">
        <h1 className="text-6xl sm:text-7xl mx-2">All-In-One Event Solution</h1>
        <p className="mt-4 md:mt-8 text-2xl md:text-4xl max-w-xl md:max-w-lg lg:max-w-xl mx-auto">
          {" "}
          Manage Guests, Sell Tickets, and Discover Events
        </p>
        <div className="mt-4">
          <Button />
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Image
          src="/screenshots/mockup.png"
          alt="screenshot of events page"
          width={350}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
