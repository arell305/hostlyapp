import MessagePage from "@/components/shared/shared-page/MessagePage";

export default function AccountNotFoundPage() {
  return (
    <MessagePage
      title="Account Not Found"
      description="Your account has been removed by an administrator. If this is a mistake, please contact support."
    />
  );
}
