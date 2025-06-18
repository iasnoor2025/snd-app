import { render, screen } from "@testing-library/react";
import { Button } from "../Button";
import { PlusIcon } from "@heroicons/react/24/outline";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument();
  });

  it("renders with left icon", () => {
    render(
      <Button leftIcon={<PlusIcon className="h-4 w-4" />}>Add Item</Button>
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument();
  });

  it("renders with right icon", () => {
    render(
      <Button rightIcon={<PlusIcon className="h-4 w-4" />}>Add Item</Button>
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
    expect(screen.getByRole("button").querySelector("svg")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });

  it("applies size classes", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9");
  });

  it("handles disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
