import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";
import { Button } from "../Button";

describe("Modal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders modal when open", () => {
    render(
      <Modal isOpen onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render modal when closed", () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("renders with title", () => {
    render(
      <Modal isOpen title="Modal Title" onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal Title")).toBeInTheDocument();
  });

  it("renders with description", () => {
    render(
      <Modal isOpen description="Modal description" onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal description")).toBeInTheDocument();
  });

  it("renders with footer", () => {
    render(
      <Modal
        isOpen
        footer={<Button>Footer Action</Button>}
        onClose={mockOnClose}
      >
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Footer Action")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <Modal isOpen onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Modal isOpen showCloseButton={false} onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <Modal isOpen isLoading onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("applies size classes", () => {
    const { rerender } = render(
      <Modal isOpen size="sm" onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveClass("sm:max-w-sm");

    rerender(
      <Modal isOpen size="lg" onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveClass("sm:max-w-lg");
  });

  it("applies custom className", () => {
    render(
      <Modal isOpen className="custom-class" onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toHaveClass("custom-class");
  });

  it("handles empty header", () => {
    render(
      <Modal isOpen showCloseButton={false} onClose={mockOnClose}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
    expect(screen.getByRole("dialog").querySelector("header")).not.toBeInTheDocument();
  });

  describe("closeOnOutsideClick", () => {
    it("calls onClose when clicking outside by default", () => {
      render(
        <Modal isOpen onClose={mockOnClose}>
          <p>Modal content</p>
        </Modal>
      );
      // Simulate clicking outside by triggering the Dialog's onOpenChange
      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("does not call onClose when clicking outside if closeOnOutsideClick is false", () => {
      render(
        <Modal isOpen closeOnOutsideClick={false} onClose={mockOnClose}>
          <p>Modal content</p>
        </Modal>
      );
      // Simulate clicking outside by triggering the Dialog's onOpenChange
      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape" });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("still allows manual close button when closeOnOutsideClick is false", () => {
      render(
        <Modal isOpen closeOnOutsideClick={false} onClose={mockOnClose}>
          <p>Modal content</p>
        </Modal>
      );
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
