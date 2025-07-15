import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Table } from "../Table";

interface TestItem {
  id: number;
  name: string;
  age: number;
}

describe("Table", () => {
  const mockData: TestItem[] = [
    { id: 1, name: "John Doe", age: 30 },
    { id: 2, name: "Jane Smith", age: 25 },
  ];

  const columns = [
    {
      key: "name",
      header: "Name",
      accessor: (item: TestItem) => item.name,
      sortable: true,
    },
    {
      key: "age",
      header: "Age",
      accessor: (item: TestItem) => item.age,
      sortable: true,
    },
  ];

  it("renders table with data", () => {
    render(<Table data={mockData} columns={columns} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<Table data={[]} columns={columns} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    render(
      <Table
        data={[]}
        columns={columns}
        emptyMessage="No records found"
      />
    );
    expect(screen.getByText("No records found")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<Table data={mockData} columns={columns} isLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("handles sort click", () => {
    const onSort = jest.fn();
    render(
      <Table
        data={mockData}
        columns={columns}
        onSort={onSort}
        sortKey="name"
        sortDirection="asc"
      />
    );
    fireEvent.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });

  it("applies custom className", () => {
    render(
      <Table
        data={mockData}
        columns={columns}
        className="custom-table"
      />
    );
    expect(screen.getByRole("table")).toHaveClass("custom-table");
  });

  it("applies row className", () => {
    render(
      <Table
        data={mockData}
        columns={columns}
        rowClassName="custom-row"
      />
    );
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveClass("custom-row");
    expect(rows[2]).toHaveClass("custom-row");
  });

  it("applies dynamic row className", () => {
    render(
      <Table
        data={mockData}
        columns={columns}
        rowClassName={(item) => `row-${item.id}`}
      />
    );
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveClass("row-1");
    expect(rows[2]).toHaveClass("row-2");
  });

  it("handles row click", () => {
    const onRowClick = jest.fn();
    render(
      <Table
        data={mockData}
        columns={columns}
        onRowClick={onRowClick}
      />
    );
    fireEvent.click(screen.getByText("John Doe").closest("tr")!);
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it("applies column className", () => {
    const columnsWithClassName = [
      {
        ...columns[0],
        className: "name-column",
      },
      columns[1],
    ];
    render(
      <Table
        data={mockData}
        columns={columnsWithClassName}
      />
    );
    expect(screen.getByText("John Doe").closest("td")).toHaveClass("name-column");
  });

  describe("Pagination", () => {
    const paginatedData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + i,
    }));

    it("shows pagination controls when total items exceed page size", () => {
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={1}
          totalItems={25}
        />
      );
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("hides pagination when showPagination is false", () => {
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={1}
          totalItems={25}
          showPagination={false}
        />
      );
      expect(screen.queryByText("Previous")).not.toBeInTheDocument();
      expect(screen.queryByText("Next")).not.toBeInTheDocument();
    });

    it("disables previous button on first page", () => {
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={1}
          totalItems={25}
        />
      );
      const prevButton = screen.getByText("Previous");
      expect(prevButton).toBeDisabled();
    });

    it("disables next button on last page", () => {
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={3}
          totalItems={25}
        />
      );
      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeDisabled();
    });

    it("calls onPageChange when clicking page number", () => {
      const onPageChange = jest.fn();
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={1}
          totalItems={25}
          onPageChange={onPageChange}
        />
      );
      fireEvent.click(screen.getByText("2"));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange when clicking next button", () => {
      const onPageChange = jest.fn();
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={1}
          totalItems={25}
          onPageChange={onPageChange}
        />
      );
      fireEvent.click(screen.getByText("Next"));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange when clicking previous button", () => {
      const onPageChange = jest.fn();
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={2}
          totalItems={25}
          onPageChange={onPageChange}
        />
      );
      fireEvent.click(screen.getByText("Previous"));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("shows correct page information", () => {
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={2}
          totalItems={25}
        />
      );
      expect(screen.getByText("Showing 11 to 20 of 25 items")).toBeInTheDocument();
    });

    it("applies custom pagination className", () => {
      render(
        <Table
          data={paginatedData}
          columns={columns}
          pageSize={10}
          currentPage={1}
          totalItems={25}
          paginationClassName="custom-pagination"
        />
      );
      const paginationContainer = screen.getByText("Showing 1 to 10 of 25 items").parentElement;
      expect(paginationContainer).toHaveClass("custom-pagination");
    });
  });
});






















