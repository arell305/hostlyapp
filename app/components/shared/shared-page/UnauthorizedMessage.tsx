import MessagePage from "./MessagePage";

export default function UnauthorizedMessage() {
  return (
    <MessagePage
      title="Unauthorized Access"
      description="You are not authorized to access this page. Please contact support if you believe this is an error."
      buttonLabel="Home"
    />
  );
}
