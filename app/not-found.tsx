import ErrorPage from "@/shared/ui/error/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      title="Page Not Found"
      description="The page you are looking for does not exist."
    />
  );
}
