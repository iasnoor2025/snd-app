import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "../Card";
import { Button } from "../Button";

describe("Card", () => {
  it("renders basic card with content", () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with title", () => {
    render(
      <Card title="Card Title">
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Card Title")).toBeInTheDocument();
  });

  it("renders with description", () => {
    render(
      <Card description="Card description">
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Card description")).toBeInTheDocument();
  });

  it("renders with footer", () => {
    render(
      <Card footer={<Button>Footer Action</Button>}>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Footer Action")).toBeInTheDocument();
  });

  it("renders with header actions", () => {
    render(
      <Card headerActions={<Button>Action</Button>}>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <Card isLoading>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Card content")).not.toBeInTheDocument();
  });

  it("applies bordered variant", () => {
    render(
      <Card variant="bordered">
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByRole("article")).toHaveClass("border-2");
  });

  it("applies elevated variant", () => {
    render(
      <Card variant="elevated">
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByRole("article")).toHaveClass("shadow-lg");
  });

  it("applies custom className", () => {
    render(
      <Card className="custom-class">
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByRole("article")).toHaveClass("custom-class");
  });

  it("handles empty header", () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(screen.getByText("Card content")).toBeInTheDocument();
    expect(screen.getByRole("article").querySelector("header")).not.toBeInTheDocument();
  });
});
