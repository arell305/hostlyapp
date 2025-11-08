"use client";

import React from "react";
import {
  CalendarSearch,
  Users,
  Ticket,
  Percent,
  CheckCircle,
  MessageCircle,
  Bot,
} from "lucide-react";
import CustomCard from "../cards/CustomCard";
import { Badge } from "../primitive/badge";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const cards: CardProps[] = [
  {
    icon: <CalendarSearch size={60} />,
    title: "Event Discovery",
    description:
      "List your events in one dedicated place, ensuring users see only your events without any clutter.",
  },
  {
    icon: <Users size={60} />,
    title: "Guest List Management",
    description:
      "Easily upload your guest list and track the results of your headcount and ticket sales.",
  },
  {
    icon: <Ticket size={60} />,
    title: "Online Ticket Sales",
    description:
      "Set ticket prices, handle multiple ticket options, and ensure secure transactions all in one place.",
  },
  {
    icon: <Percent size={60} />,
    title: "Promoter Promo Code",
    description:
      "Create and control promo codes with ease, helping promoters increase ticket sales while tracking their usage.",
  },
  {
    icon: <CheckCircle size={60} />,
    title: "Guest List Check In",
    description:
      "Fast event check-in with search functionality, allowing moderators to check in guests and credit promoters.",
  },
  {
    icon: <MessageCircle size={60} />,
    title: "SMS Integration",
    description: "Create campaigns to send SMS messages to your guests.",
  },
  {
    icon: <Bot size={60} />,
    title: "AI Messaging",
    description:
      "Use AI to generate messages and auto respond to guest messages.",
  },
];

const Features: React.FC = () => {
  const hasOddCount = cards.length % 2 === 1;
  const gridCards = hasOddCount ? cards.slice(0, -1) : cards;
  const lastCard = hasOddCount ? cards[cards.length - 1] : null;

  return (
    <div className="mx-auto px-4 py-12 max-w-6xl">
      <h2 className="text-3xl md:text-5xl text-center font-bold mb-12">
        Product Key Features
      </h2>

      {/* Grid of pairs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
        {gridCards.map((card, index) => (
          <CustomCard key={index} className="flex flex-col items-start p-4">
            <div className="mb-4 flex justify-center w-full text-gray-400">
              {card.icon}
            </div>

            <h3 className="font-bold text-xl mb-2 flex items-center">
              {card.title}
              {(card.title === "SMS Integration" ||
                card.title === "AI Messaging") && (
                <Badge variant="comingSoon" className="ml-2">
                  Coming Soon
                </Badge>
              )}
            </h3>
            <p className="text-base text-gray-400">{card.description}</p>
          </CustomCard>
        ))}
      </div>

      {/* Last odd card centered */}
      {lastCard && (
        <div className="flex justify-center mt-16">
          <CustomCard className="flex flex-col items-start max-w-md p-4">
            <div className="mb-4 flex justify-center w-full text-gray-400">
              {lastCard.icon}
            </div>
            <h3 className="font-bold text-xl mb-2 flex items-center">
              {lastCard.title}
              {(lastCard.title === "SMS Integration" ||
                lastCard.title === "AI Messaging") && (
                <Badge variant="comingSoon" className="ml-2">
                  Coming Soon
                </Badge>
              )}
            </h3>
            <p className="text-base text-gray-400">{lastCard.description}</p>
          </CustomCard>
        </div>
      )}
    </div>
  );
};

export default Features;
