import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Toast, ToastProvider, ToastViewport } from "../Toast";
import { Bell } from "lucide-react";

describe("Toast", () => {
  const renderToast = (props = {}) => {
    return render(
      <ToastProvider>
        <Toast {...props} />
        <ToastViewport />
      </ToastProvider>
    );
  };

  it("renders with title and description", () => {
    renderToast({
      title: "Toast Title",
      description: "This is a toast description",
    });

    expect(screen.getByText("Toast Title")).toBeInTheDocument();
    expect(screen.getByText("This is a toast description")).toBeInTheDocument();
  });

  it("renders with title only", () => {
    renderToast({ title: "Toast Title" });

    expect(screen.getByText("Toast Title")).toBeInTheDocument();
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renders with description only", () => {
    renderToast({ description: "This is a toast description" });

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("This is a toast description")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { rerender } = renderToast({ variant: "default" });
    expect(screen.getByRole("status")).toHaveClass("bg-background");

    rerender(
      <ToastProvider>
        <Toast variant="destructive" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status")).toHaveClass("bg-destructive");

    rerender(
      <ToastProvider>
        <Toast variant="success" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status")).toHaveClass("bg-green-500");

    rerender(
      <ToastProvider>
        <Toast variant="warning" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status")).toHaveClass("bg-yellow-500");

    rerender(
      <ToastProvider>
        <Toast variant="info" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status")).toHaveClass("bg-blue-500");
  });

  it("renders with custom icon", () => {
    renderToast({ icon: <Bell className="h-4 w-4" /> });
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();
  });

  it("renders with default icon based on variant", () => {
    const { rerender } = renderToast({ variant: "default" });
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <Toast variant="destructive" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <Toast variant="success" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <Toast variant="warning" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <Toast variant="info" />
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();
  });

  it("handles close button click", () => {
    const onClose = jest.fn();
    renderToast({
      title: "Dismissible Toast",
      onClose,
    });

    const closeButton = screen.getByRole("button");
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("auto-dismisses after duration", () => {
    jest.useFakeTimers();
    renderToast({
      title: "Auto-dismissing Toast",
      duration: 1000,
    });

    expect(screen.getByText("Auto-dismissing Toast")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText("Auto-dismissing Toast")).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it("applies custom className", () => {
    renderToast({ className: "custom-toast" });
    expect(screen.getByRole("status")).toHaveClass("custom-toast");
  });
});





















