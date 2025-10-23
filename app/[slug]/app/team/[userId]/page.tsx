import UserIdPage from "@/features/users/UserIdPage";
import { normalizeUserId } from "@/shared/lib/normalizeParams";
import { notFound } from "next/navigation";
import { use } from "react";

const Page = ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId: raw } = use(params);
  const userId = normalizeUserId(raw);
  if (!userId) {
    notFound();
  }

  return <UserIdPage userId={userId} />;
};

export default Page;
