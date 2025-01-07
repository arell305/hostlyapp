import React from "react";
import _ from "lodash";
interface NotFoundProps {
  text: string;
}

const NotFound: React.FC<NotFoundProps> = ({ text }) => {
  const capitalizedText = _.capitalize(text);
  return (
    <div className="flex flex-col items-center mt-[40px] h-screen">
      <h1 className="text-4xl font-bold">404 - {capitalizedText} Not Found</h1>
      <p className="mt-4">
        The {capitalizedText} you are looking for does not exist.
      </p>
      <a href="/" className="mt-4 text-customDarkBlue hover:underline">
        Go back to Home
      </a>
    </div>
  );
};

export default NotFound;
