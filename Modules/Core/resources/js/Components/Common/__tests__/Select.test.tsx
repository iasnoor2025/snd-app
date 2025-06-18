import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "../Select";

const options = [;
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3", disabled: true },
];

describe("Select", () => {
  it("renders basic select", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Select label="Category" options={options} />);
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
  });

  it("renders with helper text", () => {
    render(<Select helperText="Select a category" options={options} />);
    expect(screen.getByText("Select a category")).toBeInTheDocument();
  });

  it("renders with error message", () => {
    render(<Select error="This field is required" options={options} />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveClass("border-destructive");
  });

  it("renders with tooltip", () => {
    render(
      <Select
        label="Category"
        tooltip="Select a category from the list"
        options={options}
      />
    );
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<Select placeholder="Choose an option" options={options} />);
    expect(screen.getByText("Choose an option")).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(<Select disabled options={options} />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("handles disabled options", () => {
    render(<Select options={options} />);
    fireEvent.click(screen.getByRole("combobox"));
    const disabledOption = screen.getByText("Option 3");
    expect(disabledOption).toHaveAttribute("data-disabled");
  });

  it("calls onChange when selection changes", () => {
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option 1"));
    expect(handleChange).toHaveBeenCalledWith("1");
  });

  it("applies custom className", () => {
    render(<Select className="custom-class" options={options} />);
    expect(screen.getByRole("combobox")).toHaveClass("custom-class");
  });
});


</Select>
</Select>
</Select>
</Select>
</Select>
</Select>
</Select>
</Select>
</Select>

