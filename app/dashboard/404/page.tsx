import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center mt-[40px] h-screen">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">The Page you are looking for does not exist.</p>
      <a href="/" className="mt-4 text-customDarkBlue hover:underline">
        Go back to Home
      </a>
    </div>
  );
};

export default NotFound;
