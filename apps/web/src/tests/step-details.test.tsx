import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepDetails } from "@/app/(booking)/book/_components/StepDetails";

const onNext = vi.fn();
const onBack = vi.fn();

function setup(initial: Parameters<typeof StepDetails>[0]["initial"] = null) {
  const user      = userEvent.setup();
  const { container } = render(<StepDetails initial={initial} onNext={onNext} onBack={onBack} />);
  const submitForm = () => fireEvent.submit(container.querySelector("form")!);
  return { user, container, submitForm };
}

beforeEach(() => vi.clearAllMocks());

describe("StepDetails — form rendering", () => {
  it("renders all four fields", () => {
    setup();
    expect(screen.getByPlaceholderText(/jane doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane@example/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+91/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/create a password/i)).toBeInTheDocument();
  });

  it("renders Review booking submit button", () => {
    setup();
    expect(screen.getByRole("button", { name: /review booking/i })).toBeInTheDocument();
  });

  it("pre-fills fields from initial prop", () => {
    render(
      <StepDetails
        initial={{ name: "Priya", email: "p@test.com", phone: "9876543210", password: "secret99" }}
        onNext={onNext}
        onBack={onBack}
      />,
    );
    expect(screen.getByDisplayValue("Priya")).toBeInTheDocument();
    expect(screen.getByDisplayValue("p@test.com")).toBeInTheDocument();
  });
});

describe("StepDetails — Zod validation errors", () => {
  // Use fireEvent.submit to bypass JSDOM's native HTML5 constraint validation
  // so react-hook-form's Zod resolver actually runs.

  it("shows all required-field errors on empty submit", async () => {
    const { submitForm } = setup();
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid phone/i)).toBeInTheDocument();
    expect(screen.getByText(/password must be at least 8/i)).toBeInTheDocument();
  });

  it("shows email format error when email has no TLD (passes HTML5, fails Zod)", async () => {
    // "a@b" satisfies HTML5 email (no TLD required by spec) but fails Zod's stricter check.
    const { user, submitForm } = setup();
    await user.type(screen.getByPlaceholderText(/jane doe/i), "Jane Doe");
    await user.type(screen.getByPlaceholderText(/jane@example/i), "a@b");
    await user.type(screen.getByPlaceholderText(/\+91/i), "9876543210");
    await user.type(screen.getByPlaceholderText(/create a password/i), "password123");
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument();
  });

  it("shows phone error for a too-short number", async () => {
    const { user, submitForm } = setup();
    await user.type(screen.getByPlaceholderText(/jane doe/i), "Jane Doe");
    await user.type(screen.getByPlaceholderText(/jane@example/i), "jane@example.com");
    await user.type(screen.getByPlaceholderText(/\+91/i), "12345");
    await user.type(screen.getByPlaceholderText(/create a password/i), "password123");
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/enter a valid phone/i)).toBeInTheDocument();
    });
  });

  it("shows password error for a short password", async () => {
    const { user, submitForm } = setup();
    await user.type(screen.getByPlaceholderText(/jane doe/i), "Jane Doe");
    await user.type(screen.getByPlaceholderText(/jane@example/i), "jane@example.com");
    await user.type(screen.getByPlaceholderText(/\+91/i), "9876543210");
    await user.type(screen.getByPlaceholderText(/create a password/i), "abc");
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8/i)).toBeInTheDocument();
    });
  });
});

describe("StepDetails — valid submission", () => {
  it("calls onNext with correct data when form is valid", async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/jane doe/i),         "Priya Sharma");
    await user.type(screen.getByPlaceholderText(/jane@example/i),     "priya@test.com");
    await user.type(screen.getByPlaceholderText(/\+91/i),             "9876543210");
    await user.type(screen.getByPlaceholderText(/create a password/i),"password123");
    await user.click(screen.getByRole("button", { name: /review booking/i }));

    // react-hook-form calls onNext(data, event) — check only the first argument (data)
    await waitFor(() => expect(onNext).toHaveBeenCalled());
    expect(onNext.mock.calls[0][0]).toEqual({
      name:     "Priya Sharma",
      email:    "priya@test.com",
      phone:    "9876543210",
      password: "password123",
    });
  });

  it("does not show any errors when all fields are valid", async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText(/jane doe/i),         "Ananya Reddy");
    await user.type(screen.getByPlaceholderText(/jane@example/i),     "ananya@example.com");
    await user.type(screen.getByPlaceholderText(/\+91/i),             "9123456789");
    await user.type(screen.getByPlaceholderText(/create a password/i),"secure_pw1");
    await user.click(screen.getByRole("button", { name: /review booking/i }));
    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });
});

describe("StepDetails — Back button", () => {
  it("calls onBack when Back is clicked", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
  });
});
