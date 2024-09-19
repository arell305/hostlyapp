import { render, screen } from "@testing-library/react";
import Confirmation from "@/confirmation/page";

describe("Confirmation", () => {
  it("renders Payment Form", () => {
    render(<Confirmation />);
    expect(screen.getByText("Congratulations!")).toBeInTheDocument();
  });
});
