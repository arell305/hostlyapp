import React from "react";

const UnauthorizedComponent: React.FC = () => {
  return (
    <div className="flex flex-col items-center mt-[40px] h-screen">
      <h1 className="text-4xl font-bold">Unauthorized</h1>
      <p className="mt-4">You are uanuthorized for this page.</p>
    </div>
  );
};

export default UnauthorizedComponent;
