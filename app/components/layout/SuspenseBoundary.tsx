import React, { Suspense } from "react";

interface SuspenseBoundaryProps {
  children: React.ReactNode;
}

const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({ children }) => (
  <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
);

export default SuspenseBoundary;
