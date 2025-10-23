"use client";

export default function FaqView({
  question,
  answer,
  className,
}: {
  question: string;
  answer: string;
  className?: string;
}) {
  return (
    <div className={className ?? "flex flex-col gap-2"}>
      <p className="text-lg font-semibold">{question}</p>
      <p>{answer}</p>
    </div>
  );
}
