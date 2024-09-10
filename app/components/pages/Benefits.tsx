import { BentoGrid, BentoGridItem } from "../shared/BentoGrid";
const items = [
  {
    title: "🎯 Attract More Guests ",
    description: (
      <>
        <p className="mb-2">
          Our app makes it easier to promote your event and capture the
          attention of potential attendees.
        </p>
      </>
    ),
    header: "",
    size: "large",
  },
  {
    title: "🛠️ Automated Guest Management ",
    description: (
      <p>
        Track RSVPs, attendance, and payments effortlessly with our streamlined
        app.
      </p>
    ),
    header: "",
    size: "large",
  },
  {
    title: "⚙️ Drive Revenue With Ticket Sales ",
    description: (
      <p>Generate more revenue with our streamlined ticket sales system</p>
    ),
    header: "",
    size: "large",
  },
  {
    title: "🌐 Centralized Event Hub ",
    description: (
      <p>
        One platform for managing all your event needs, saving you time and
        reducing inefficiencies.
      </p>
    ),
    header: "",
    size: "large",
  },
];

const Benefits = () => {
  return (
    <section className="mt-10" id="benefits">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-medium mb-6 md:mb-12">
          How We Solve These Challenges
        </h2>
        <div className="flex justify-center max-w-2xl mx-auto">
          <BentoGrid className="flex flex-col justify-center">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                className={`border border-gray-300 p-4`}
                size={item.size}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
