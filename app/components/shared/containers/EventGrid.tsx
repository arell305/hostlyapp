// "use client";

// import React from "react";

// interface EventGridProps {
//   children: React.ReactNode;
//   className?: string;
// }

// const EventGrid: React.FC<EventGridProps> = ({ children, className = "" }) => {
//   return (
//     <div
//       className={`w-full grid grid-cols-1 md:grid-cols-3  gap-y-8 gap-x-4 justify-items-center ${className}`}
//     >
//       {children}
//     </div>
//   );
// };

// export default EventGrid;
"use client";

import React from "react";

interface EventGridProps {
  children: React.ReactNode;
  className?: string;
}

const EventGrid: React.FC<EventGridProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`
        w-full
        grid grid-cols-1
        md:grid-cols-3
        gap-y-6 md:gap-y-8
        gap-x-2 md:gap-x-4
        justify-items-center
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default EventGrid;
