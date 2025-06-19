import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs } from "../Tabs";
import { User, Settings, Bell } from "lucide-react";

describe("Tabs", () => {
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

  it("renders tabs with content", () => {
    render(<Tabs items={mockItems} />);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Profile Content")).toBeInTheDocument();
  });

  it("changes content when tab is clicked", () => {
    render(<Tabs items={mockItems} />);

    fireEvent.click(screen.getByText("Settings"));
    expect(screen.getByText("Settings Content")).toBeInTheDocument();
    expect(screen.queryByText("Profile Content")).not.toBeInTheDocument();
  });

  it("handles disabled tabs", () => {
    render(<Tabs items={mockItems} />);

    const notificationsTab = screen.getByText("Notifications").closest("button");
    expect(notificationsTab).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<Tabs items={mockItems} isLoading />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Profile Content")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Tabs items={mockItems} className="custom-tabs" />);

    expect(screen.getByRole("tablist").parentElement).toHaveClass("custom-tabs");
  });

  it("applies size classes", () => {
    const { rerender } = render(<Tabs items={mockItems} size="sm" />);
    expect(screen.getByText("Profile")).toHaveClass("text-sm");

    rerender(<Tabs items={mockItems} size="lg" />);
    expect(screen.getByText("Profile")).toHaveClass("text-lg");
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Tabs items={mockItems} variant="bordered" />);
    expect(screen.getByRole("tablist")).toHaveClass("border-b");

    rerender(<Tabs items={mockItems} variant="pills" />);
    expect(screen.getByRole("tablist")).toHaveClass("bg-muted");
  });

  it("handles vertical orientation", () => {
    render(<Tabs items={mockItems} orientation="vertical" />);

    expect(screen.getByRole("tablist").parentElement).toHaveClass("flex");
    expect(screen.getByRole("tablist")).toHaveClass("flex-col");
  });

  it("handles full width", () => {
    render(<Tabs items={mockItems} fullWidth />);

    expect(screen.getByRole("tablist")).toHaveClass("w-full");
    expect(screen.getByText("Profile").closest("button")).toHaveClass("flex-1");
  });

  it("calls onValueChange when tab is clicked", () => {
    const onValueChange = jest.fn();
    render(<Tabs items={mockItems} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByText("Settings"));
    expect(onValueChange).toHaveBeenCalledWith("settings");
  });

  it("uses controlled value when provided", () => {
    render(<Tabs items={mockItems} value="settings" />);

    expect(screen.getByText("Settings Content")).toBeInTheDocument();
    expect(screen.queryByText("Profile Content")).not.toBeInTheDocument();
  });

  describe("defaultValue", () => {
    it("uses defaultValue to set initial active tab", () => {
      render(<Tabs items={mockItems} defaultValue="settings" />);
      expect(screen.getByText("Settings Content")).toBeInTheDocument();
      expect(screen.queryByText("Profile Content")).not.toBeInTheDocument();
    });

    it("falls back to first tab when defaultValue is invalid", () => {
      render(<Tabs items={mockItems} defaultValue="invalid" />);
      expect(screen.getByText("Profile Content")).toBeInTheDocument();
    });

    it("ignores defaultValue when value prop is provided", () => {
      render(
        <Tabs
          items={mockItems}
          defaultValue="settings"
          value="profile"
        />
      );
      expect(screen.getByText("Profile Content")).toBeInTheDocument();
      expect(screen.queryByText("Settings Content")).not.toBeInTheDocument();
    });
  });

  describe("icon rendering", () => {
    it("renders icon before label", () => {
      render(<Tabs items={mockItems} />);
      const profileTab = screen.getByText("Profile").closest("button");
      const icon = profileTab?.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon?.parentElement).toHaveClass("mr-2");
    });

    it("renders icon with correct size", () => {
      render(<Tabs items={mockItems} />);
      const icon = screen.getByText("Profile").closest("button")?.querySelector("svg");
      expect(icon).toHaveClass("h-4 w-4");
    });

    it("renders icon in vertical orientation", () => {
      render(<Tabs items={mockItems} orientation="vertical" />);
      const profileTab = screen.getByText("Profile").closest("button");
      const icon = profileTab?.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(profileTab).toHaveClass("justify-start");
    });

    it("renders icon in full width mode", () => {
      render(<Tabs items={mockItems} fullWidth />);
      const profileTab = screen.getByText("Profile").closest("button");
      const icon = profileTab?.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(profileTab).toHaveClass("flex-1");
    });

    it("renders icon with different variants", () => {
      const { rerender } = render(<Tabs items={mockItems} variant="bordered" />);
      expect(screen.getByText("Profile").closest("button")?.querySelector("svg")).toBeInTheDocument();

      rerender(<Tabs items={mockItems} variant="pills" />);
      expect(screen.getByText("Profile").closest("button")?.querySelector("svg")).toBeInTheDocument();
    });
  });
});






















