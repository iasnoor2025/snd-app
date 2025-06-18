import { render, screen } from "@testing-library/react";
import { Input } from "../Input";
import { SearchIcon } from "lucide-react";

describe("Input", () => {
  it("renders basic input", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
  });

  it("renders with helper text", () => {
    render(<Input helperText="This is a helper text" />);
    expect(screen.getByText("This is a helper text")).toBeInTheDocument();
  });

  it("renders with error message", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("border-destructive");
  });

  it("renders with tooltip", () => {
    render(<Input label="Password" tooltip="Must be at least 8 characters" />);
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("renders with left icon", () => {
    render(<Input leftIcon={<SearchIcon className="h-4 w-4" />} />);
    expect(screen.getByRole("textbox")).toHaveClass("pl-10");
  });

  it("renders with right icon", () => {
    render(<Input rightIcon={<SearchIcon className="h-4 w-4" />} />);
    expect(screen.getByRole("textbox")).toHaveClass("pr-10");
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom-class");
  });

  it("handles disabled state", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

</Input>
</Input>
</Input>
</Input>
</Input>
</Input>
</Input>
</Input>
</Input>

