import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Accordion } from "../Accordion";
import { User, Settings, Bell } from "lucide-react";

describe("Accordion", () => {
  const mockItems = [;
    {
      value: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      content: <div>Profile Content</div>,
    },
    {
      value: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
      content: <div>Settings Content</div>,
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      content: <div>Notifications Content</div>,
      disabled: true,
    },
  ];

  it("renders accordion items", () => {
    render(<Accordion items={mockItems} />);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("expands and collapses items when clicked", () => {
    render(<Accordion items={mockItems} />);

    // Click to expand
    fireEvent.click(screen.getByText("Profile"));
    expect(screen.getByText("Profile Content")).toBeVisible();

    // Click to collapse
    fireEvent.click(screen.getByText("Profile"));
    expect(screen.queryByText("Profile Content")).not.toBeVisible();
  });

  it("handles disabled items", () => {
    render(<Accordion items={mockItems} />);

    const notificationsTrigger = screen.getByText("Notifications").closest("button");
    expect(notificationsTrigger).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<Accordion items={mockItems} isLoading />);

    expect(screen.getAllByRole("status")).toHaveLength(3);
    expect(screen.queryByText("Profile Content")).not.toBeVisible();
  });

  it("applies custom className", () => {
    render(<Accordion items={mockItems} className="custom-accordion" />);

    expect(screen.getByRole("region")).toHaveClass("custom-accordion");
  });

  it("applies size classes", () => {
    const { rerender } = render(<Accordion items={mockItems} size="sm" />);
    expect(screen.getByText("Profile")).toHaveClass("text-sm");

    rerender(<Accordion items={mockItems} size="lg" />);
    expect(screen.getByText("Profile")).toHaveClass("text-lg");
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Accordion items={mockItems} variant="bordered" />);
    expect(screen.getByRole("region")).toHaveClass("border");

    rerender(<Accordion items={mockItems} variant="separated" />);
    expect(screen.getByRole("region")).toHaveClass("space-y-2");
  });

  it("handles multiple selection", () => {
    render(<Accordion items={mockItems} type="multiple" />);

    // Click multiple items
    fireEvent.click(screen.getByText("Profile"));
    fireEvent.click(screen.getByText("Settings"));

    // Both should be visible
    expect(screen.getByText("Profile Content")).toBeVisible();
    expect(screen.getByText("Settings Content")).toBeVisible();
  });

  it("calls onValueChange when items are clicked", () => {
    const onValueChange = jest.fn();
    render(<Accordion items={mockItems} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByText("Profile"));
    expect(onValueChange).toHaveBeenCalledWith("profile");
  });

  it("uses controlled value when provided", () => {
    render(<Accordion items={mockItems} value="profile" />);

    expect(screen.getByText("Profile Content")).toBeVisible();
    expect(screen.queryByText("Settings Content")).not.toBeVisible();
  });

  describe("defaultValue", () => {
    it("uses defaultValue to set initial expanded item", () => {
      render(<Accordion items={mockItems} defaultValue="settings" />);
      expect(screen.getByText("Settings Content")).toBeVisible();
      expect(screen.queryByText("Profile Content")).not.toBeVisible();
    });

    it("uses defaultValue array for multiple type", () => {
      render(
        <Accordion
          items={mockItems}
          type="multiple"
          defaultValue={["profile", "settings"]}
        />
      );
      expect(screen.getByText("Profile Content")).toBeVisible();
      expect(screen.getByText("Settings Content")).toBeVisible();
    });

    it("ignores defaultValue when value prop is provided", () => {
      render(
        <Accordion
          items={mockItems}
          defaultValue="settings"
          value="profile"
        />
      );
      expect(screen.getByText("Profile Content")).toBeVisible();
      expect(screen.queryByText("Settings Content")).not.toBeVisible();
    });
  });

  describe("collapsible", () => {
    it("allows collapsing items by default", () => {
      render(<Accordion items={mockItems} />);

      // Expand
      fireEvent.click(screen.getByText("Profile"));
      expect(screen.getByText("Profile Content")).toBeVisible();

      // Collapse
      fireEvent.click(screen.getByText("Profile"));
      expect(screen.queryByText("Profile Content")).not.toBeVisible();
    });

    it("prevents collapsing items when collapsible is false", () => {
      render(<Accordion items={mockItems} collapsible={false} />);

      // Expand
      fireEvent.click(screen.getByText("Profile"));
      expect(screen.getByText("Profile Content")).toBeVisible();

      // Try to collapse
      fireEvent.click(screen.getByText("Profile"));
      expect(screen.getByText("Profile Content")).toBeVisible();
    });

    it("allows expanding another item when collapsible is false", () => {
      render(<Accordion items={mockItems} collapsible={false} />);

      // Expand first item
      fireEvent.click(screen.getByText("Profile"));
      expect(screen.getByText("Profile Content")).toBeVisible();

      // Expand second item
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("Settings Content")).toBeVisible();
      expect(screen.queryByText("Profile Content")).not.toBeVisible();
    });
  });

  describe("icon rendering", () => {
    it("renders icon before label", () => {
      render(<Accordion items={mockItems} />);
      const profileTrigger = screen.getByText("Profile").closest("button");
      const icon = profileTrigger?.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon?.parentElement?.parentElement).toHaveClass("gap-2");
    });

    it("renders icon with correct size", () => {
      render(<Accordion items={mockItems} />);
      const icon = screen.getByText("Profile").closest("button")?.querySelector("svg");
      expect(icon).toHaveClass("h-4 w-4");
    });

    it("renders icon with different variants", () => {
      const { rerender } = render(<Accordion items={mockItems} variant="bordered" />);
      expect(screen.getByText("Profile").closest("button")?.querySelector("svg")).toBeInTheDocument();

      rerender(<Accordion items={mockItems} variant="separated" />);
      expect(screen.getByText("Profile").closest("button")?.querySelector("svg")).toBeInTheDocument();
    });

    it("renders icon with different sizes", () => {
      const { rerender } = render(<Accordion items={mockItems} size="sm" />);
      expect(screen.getByText("Profile").closest("button")?.querySelector("svg")).toBeInTheDocument();

      rerender(<Accordion items={mockItems} size="lg" />);
      expect(screen.getByText("Profile").closest("button")?.querySelector("svg")).toBeInTheDocument();
    });
  });
});






















