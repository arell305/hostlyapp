"use client";

interface NotFoundProps {
  text: string;
  message?: string | null;
}

const ErrorFetch: React.FC<NotFoundProps> = ({ text, message }) => {
  return (
    <div className="flex flex-col items-center mt-[40px] h-screen">
      <h1 className="text-4xl font-bold">Error</h1>
      <p className="mt-4">There has been an error fetching {text}.</p>
      <p className="mt-4">{message}</p>
    </div>
  );
};

export default ErrorFetch;
