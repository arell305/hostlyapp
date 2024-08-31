import { render, screen } from "@testing-library/react";
import Login from "../../../src/app/login/page";
import "@testing-library/jest-dom";

describe("Login Component", () => {
  it("renders the login component with heading", () => {
    render(<Login />);

    // Check if the main heading is rendered
    const heading = screen.getByRole("heading", { name: /Login to Hostly/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders Google login button", () => {
    render(<Login />);

    // Check if the Google login button is rendered
    const googleButton = screen.getByRole("link", {
      name: /Continue with Google/i,
    });
    expect(googleButton).toBeInTheDocument();
  });

  it("renders Apple login button", () => {
    render(<Login />);

    // Check if the Apple login button is rendered
    const appleButton = screen.getByRole("link", {
      name: /Continue with Apple/i,
    });
    expect(appleButton).toBeInTheDocument();
  });

  it("renders Talk With Sales button", () => {
    render(<Login />);

    // Check if the Talk With Sales button is rendered
    const talkWithSalesButton = screen.getByRole("link", {
      name: /Talk With Sales/i,
    });
    expect(talkWithSalesButton).toBeInTheDocument();
  });
});
