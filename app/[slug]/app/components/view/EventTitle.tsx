import React from "react";
import _ from "lodash";

interface EventTitleProps {
  title: string;
  className?: string;
}

const EventTitle: React.FC<EventTitleProps> = ({ title, className = "" }) => {
  return (
    <h1 className={`font-bold text-6xl mt-4 md:mt-0 ${className}`}>
      {_.capitalize(title)}
    </h1>
  );
};

export default EventTitle;
