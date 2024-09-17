import { render, screen } from "@testing-library/react";
import Confirmation from "../../../../app/confirmation/page";

describe("Confirmation Component", () => {
  it("renders without crashing", () => {
    render(<Confirmation />);
    // Check for the presence of the "Congratulations!" text
    expect(screen.getByText("Congratulations!")).toBeInTheDocument();
  });
});
