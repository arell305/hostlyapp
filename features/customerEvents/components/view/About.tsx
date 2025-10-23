"use client";

import CustomCard from "@/shared/ui/cards/CustomCard";
import { cn } from "@/shared/lib/utils";

interface AboutProps {
  description: string | null;
  className?: string;
}

const About: React.FC<AboutProps> = ({ description, className }) => {
  if (!description) {
    return null;
  }

  return (
    <CustomCard className={cn("w-[95%] py-3 px-4 shadow mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-3 text-start">About</h2>
      <p className="text-base md:text-sm">{description}</p>
    </CustomCard>
  );
};

export default About;
