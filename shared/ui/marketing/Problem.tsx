import { BentoGrid, BentoGridItem } from "../list/BentoGrid";
const items = [
  {
    title: "📉 Not Bringing enough people",
    description: (
      <>
        <p className="mb-2">
          It&quot;s&quot; tough to stand out in a crowded event market.
          Potential attendees can feel overwhelmed and overlook your event.
        </p>
      </>
    ),
    header: "",
    size: "large",
  },
  {
    title: "🗂️ Complex Guest Management",
    description: (
      <p>
        Managing a large guest list is challenging, from tracking RSVPs and
        attendance to handling payments for promoters.
      </p>
    ),
    header: "",
    size: "large",
  },
  {
    title: "🚧 Ticketing Obstacles",
    description: (
      <p>
        Managing ticket prices, promo codes, and attendance can be complex and
        prone to errors.
      </p>
    ),
    header: "",
    size: "large",
  },
  {
    title: "🧩 Disjointed Event Solutions",
    description: (
      <p>
        Handling events often means juggling various systems for different
        tasks—ticket sales, guest management, promotions, and more. These
        disparate tools can be confusing and lead to inefficiencies.
      </p>
    ),
    header: "",
    size: "large",
  },
];

const Problem = () => {
  return (
    <section className="mt-10">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-medium mb-6 md:mb-12">
          The Challenges of Event Management
        </h2>
        <div className="flex justify-center max-w-2xl mx-auto">
          <BentoGrid className="flex flex-col justify-center">
            {items.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                className={`border-2 border-gray-300 p-4`}
                size={item.size}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
};

export default Problem;
