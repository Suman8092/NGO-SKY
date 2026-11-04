import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RecordsTable } from "./records-table";

describe("operational record navigation", () => {
  it("filters records, pages results, and handles an empty search", () => {
    render(<RecordsTable label="Donations"><thead><tr><th>Name</th></tr></thead><tbody>{Array.from({ length: 12 }, (_, index) => <tr key={index}><td>Supporter {index + 1}</td></tr>)}</tbody></RecordsTable>);
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.queryByText("Supporter 12")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Supporter 12")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Supporter 3" } });
    expect(screen.getByText("Supporter 3")).toBeInTheDocument();
    expect(screen.queryByText("Supporter 12")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "missing" } });
    expect(screen.getByText("No records match your search.")).toBeInTheDocument();
  });
});
