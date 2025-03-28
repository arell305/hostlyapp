// import { BentoGrid, BentoGridItem } from "../shared/BentoGrid";
// import Image from "next/image";

// const items = [
//   {
//     title: "Event Discovery",
//     description: (
//       <>
//         <p>
//           List your events in one dedicated place, ensuring users see only your
//           events without any clutter.
//         </p>
//         <Image
//           src="/screenshots/events.png"
//           alt="screenshot of events"
//           width={320}
//           height={600}
//           className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
//         />
//       </>
//     ),
//     header: "",
//     size: "small",
//   },
//   {
//     title: "Guest List Management",
//     description: (
//       <>
//         <p>
//           Easily upload your guest list and track the results of your headcount
//           and ticket sales.
//         </p>
//         <Image
//           src="/screenshots/guest-list-management.png"
//           alt="screenshot of guest list functionality"
//           width={320}
//           height={600}
//           className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
//         />
//       </>
//     ),
//     header: "",
//     size: "small",
//   },
//   {
//     title: "Online Ticket Sales",
//     description: (
//       <>
//         <p>
//           Set ticket prices, handle multiple ticket options, and ensure secure
//           transactions all in one place
//         </p>
//         <Image
//           src="/screenshots/tickets.png"
//           alt="screenshot of tickets functionality"
//           width={320}
//           height={600}
//           className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
//         />
//       </>
//     ),
//     header: "",
//     size: "small",
//   },
//   {
//     title: "Promoter Promo Code",
//     description: (
//       <>
//         <p className="mb-2">
//           Create and control promo codes with ease, helping promoters increase
//           ticket sales while tracking their usage.
//         </p>
//         <Image
//           src="/screenshots/promo-code.png"
//           alt="screenshot of promo code"
//           width={320}
//           height={600}
//           className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
//         />
//       </>
//     ),
//     header: "",
//     size: "small",
//   },

//   {
//     title: "Guest List Check In",
//     description: (
//       <>
//         <p>
//           Fast event check-in with search functionality, allowing moderators to
//           check in guests and credit promoters.
//         </p>
//         <Image
//           src="/screenshots/check-in.png"
//           alt="screenshot of check in"
//           width={320}
//           height={600}
//           className="mx-auto mt-2 rounded-md border-2 border-customDarkBlue"
//         />
//       </>
//     ),
//     header: "",
//     size: "small",
//   },
// ];

// const Features = () => {
//   return (
//     <section className="mt-10" id="features">
//       <div className="container mx-auto px-4">
//         <h2 className="text-center font-raleway text-2xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-12">
//           Product Key Features
//         </h2>
//         <div className="flex  mx-auto">
//           <BentoGrid className="flex flex-wrap justify-center">
//             {items.map((item, i) => (
//               <BentoGridItem
//                 key={i}
//                 title={item.title}
//                 description={item.description}
//                 header={item.header}
//                 className={` p-4 w-[350px]`}
//                 size={item.size}
//               />
//             ))}
//           </BentoGrid>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Features;

import Image from "next/image";
import React from "react";

interface CardProps {
  image: string;
  title: string;
  description: string;
}

const cards: CardProps[] = [
  {
    image: "/product-features/event-discovery-image.png",
    title: "Event Discovery",
    description:
      "List your events in one dedicated place, ensuring users see only your events without any clutter.",
  },
  {
    image: "/product-features/guest-list-management.png",
    title: "Guest List Management",
    description:
      "Easily upload your guest list and track the results of your headcount and ticket sales.",
  },
  {
    image: "/product-features/online-ticket-sales.png",
    title: "Online Ticket Sales",
    description:
      "Set ticket prices, handle multiple ticket options, and ensure secure transactions all in one place.",
  },
  {
    image: "/product-features/promoter-promo-code.png",
    title: "Promoter Promo Code",
    description:
      "Create and control promo codes with ease, helping promoters increase ticket sales while tracking their usage.",
  },
  {
    image: "/product-features/guest-list-check-in.png",
    title: "Guest List Check In",
    description:
      "Fast event check-in with search functionality, allowing moderators to check in guests and credit promoters.",
  },
];

const Features: React.FC = () => {
  const firstRow = cards.slice(0, 3);
  const lastRow = cards.slice(3);

  return (
    <div className=" mx-auto px-4 py-8 space-y-8">
      <h2 className="text-3xl md:text-5xl  text-center font-raleway font-bold">
        Product Key Features
      </h2>
      <div className="flex flex-wrap justify-center md:justify-between gap-6">
        {firstRow.map((card, index) => (
          <div
            key={index}
            className="flex flex-col w-full sm:w-[45%] md:w-[30%]"
          >
            <Image
              src={card.image}
              alt={card.title}
              width={600}
              height={700}
              className="w-full h-[300px] object-cover rounded-xl mb-4"
              priority
            />

            <h3 className="font-bold text-xl mb-2 font-raleway">
              {card.title}
            </h3>
            <p className="text-base text-gray-700">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Second row: centered 2 items */}
      <div className="flex flex-wrap justify-center gap-8">
        {lastRow.map((card, index) => (
          <div
            key={index + 3}
            className="flex flex-col w-full sm:w-[45%] md:w-[30%]"
          >
            <Image
              src={card.image}
              alt={card.title}
              width={600}
              height={700}
              className="w-full h-[300px] object-cover rounded-xl mb-4"
              priority
            />

            <h3 className="font-bold text-xl mb-2 font-raleway">
              {card.title}
            </h3>
            <p className="text-base text-gray-700">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
