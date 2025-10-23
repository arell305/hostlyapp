import MessagePage from "./MessagePage";

export default function NotFoundMessage() {
  return (
    <MessagePage
      title="Not Found"
      description="The page you are looking for does not exist."
      buttonLabel="Home"
    />
  );
}
