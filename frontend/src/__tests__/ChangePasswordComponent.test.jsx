import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ChangePasswordComponent from "../components/ChangePasswordComponent.jsx";

describe("ChangePasswordComponent", () => {
  it("renders all input fields and buttons", () => {
    render(<ChangePasswordComponent onCancel={() => {}} />);
    
    expect(screen.getByPlaceholderText("Current Password")).toBeDefined();
    expect(screen.getByPlaceholderText("New Password")).toBeDefined();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeDefined();
  });

  it("shows an error message when new passwords do not match", async () => {
    render(<ChangePasswordComponent onCancel={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("New Password"), {
      target: { value: "Password123!" }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "DifferentPassword123!" }
    });

    fireEvent.click(screen.getByRole("button", { name: /update password/i }));

    const errorMessage = await screen.findByText("New passwords do not match.");
    expect(errorMessage).toBeDefined();
  });
});