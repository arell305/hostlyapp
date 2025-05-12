import React from "react";
import _ from "lodash";

interface EventTitleProps {
  title: string;
  className?: string;
}

const EventTitle: React.FC<EventTitleProps> = ({ title, className = "" }) => {
  return (
    <h1 className={`font-bold text-6xl  ${className}`}>
      {_.capitalize(title)}
    </h1>
  );
};

export default EventTitle;
