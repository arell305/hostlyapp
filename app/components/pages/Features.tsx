import { BentoGrid, BentoGridItem } from "../shared/BentoGrid";
import Image from "next/image";

const items = [
  {
    title: "Event Discovery",
    description: (
      <>
        <p>
          List your events in one dedicated place, ensuring users see only your
          events without any clutter.
        </p>
        <Image
          src="/screenshots/events.png"
          alt="screenshot of events"
          width={320}
          height={600}
          className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
        />
      </>
    ),
    header: "",
    size: "small",
  },
  {
    title: "Guest List Management",
    description: (
      <>
        <p>
          Easily upload your guest list and track the results of your headcount
          and ticket sales.
        </p>
        <Image
          src="/screenshots/guest-list-management.png"
          alt="screenshot of guest list functionality"
          width={320}
          height={600}
          className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
        />
      </>
    ),
    header: "",
    size: "small",
  },
  {
    title: "Online Ticket Sales",
    description: (
      <>
        <p>
          Set ticket prices, handle multiple ticket options, and ensure secure
          transactions all in one place
        </p>
        <Image
          src="/screenshots/tickets.png"
          alt="screenshot of tickets functionality"
          width={320}
          height={600}
          className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
        />
      </>
    ),
    header: "",
    size: "small",
  },
  {
    title: "Promoter Promo Code",
    description: (
      <>
        <p className="mb-2">
          Create and control promo codes with ease, helping promoters increase
          ticket sales while tracking their usage.
        </p>
        <Image
          src="/screenshots/promo-code.png"
          alt="screenshot of promo code"
          width={320}
          height={600}
          className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
        />
      </>
    ),
    header: "",
    size: "small",
  },

  {
    title: "Guest List Check In",
    description: (
      <>
        <p>
          Fast event check-in with search functionality, allowing moderators to
          check in guests and credit promoters.
        </p>
        <Image
          src="/screenshots/check-in.png"
          alt="screenshot of check in"
          width={320}
          height={600}
          className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
        />
      </>
    ),
    header: "",
    size: "small",
  },
];

const Features = () => {
  return (
    <section className="mt-10" id="features">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-medium mb-6 md:mb-12">
          Key Features
        </h2>
        <div className="flex  mx-auto">
          <BentoGrid className="flex flex-wrap justify-center">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                className={`border border-gray-300 p-4 w-[350px]`}
                size={item.size}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
};

export default Features;
