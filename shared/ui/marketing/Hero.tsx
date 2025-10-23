import { Button } from "@/shared/ui/primitive/button";

const Hero = () => {
  return (
    <section
      id="home"
      className="flex flex-col  md:h-[100dvh] mt-28 md:mt-0 mb-28 md:mb-0 justify-center overflow-hidden"
    >
      <div className="flex text-center justify-center flex-col ">
        <h1 className="text-4xl sm:text-7xl mx-2 font-raleway font-bold">
          Event Management For Promoters
        </h1>
        <p className="mt-4 md:mt-8 md:text-xl  max-w-xl md:max-w-lg lg:max-w-xl mx-auto">
          {" "}
          Manage Guests, Sell Tickets, and Discover Events
        </p>
        <div className="mt-10">
          <a href="#demo">
            <Button className="rounded-[12px] text-lg font-bold" size="lg">
              Book a Demo
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
