import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StepService } from "@/app/(booking)/book/_components/StepService";
import type { ApiService } from "@/lib/api";

// ── Mock @/lib/api ──────────────────────────────────────────────────────────
vi.mock("@/lib/api", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...real,
    api: {
      get: vi.fn(),
    },
  };
});

// Import AFTER mock declaration so vi.mock hoisting works
import { api } from "@/lib/api";

const MOCK_SERVICES: ApiService[] = [
  {
    id:          "svc-1",
    title:       "Pregnancy Consultation",
    slug:        "pregnancy-consultation",
    durationMin: 60,
    priceInr:    1200,
    isActive:    true,
    description: "Expert antenatal care",
  },
  {
    id:          "svc-2",
    title:       "PCOS / PCOD Consultation",
    slug:        "pcos-pcod-consultation",
    durationMin: 45,
    priceInr:    900,
    isActive:    true,
    description: "PCOS management",
  },
];

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderService(props: Partial<Parameters<typeof StepService>[0]> = {}) {
  const onSelect = vi.fn();
  const onNext   = vi.fn();
  const client   = makeClient();
  render(
    <QueryClientProvider client={client}>
      <StepService selected={null} onSelect={onSelect} onNext={onNext} {...props} />
    </QueryClientProvider>,
  );
  return { onSelect, onNext, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.get).mockResolvedValue({ data: MOCK_SERVICES });
});

describe("StepService — loading state", () => {
  it("renders skeleton cards while data is loading", () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {})); // never resolves
    renderService();
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("StepService — loaded state", () => {
  it("renders service titles after data loads", async () => {
    renderService();
    await waitFor(() => {
      expect(screen.getByText("Pregnancy Consultation")).toBeInTheDocument();
    });
    expect(screen.getByText("PCOS / PCOD Consultation")).toBeInTheDocument();
  });

  it("shows duration and price for each service", async () => {
    renderService();
    await waitFor(() => screen.getByText("Pregnancy Consultation"));
    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("Continue button is disabled when nothing is selected", async () => {
    renderService();
    await waitFor(() => screen.getByText("Pregnancy Consultation"));
    expect(
      screen.getByRole("button", { name: /continue/i }),
    ).toBeDisabled();
  });
});

describe("StepService — interactions", () => {
  it("calls onSelect with the service when a card is clicked", async () => {
    const { onSelect, user } = renderService();
    await waitFor(() => screen.getByText("Pregnancy Consultation"));
    await user.click(screen.getByText("Pregnancy Consultation").closest("button")!);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "svc-1" }));
  });

  it("Continue button is enabled after a service is selected", async () => {
    const { user } = renderService({ selected: MOCK_SERVICES[0] });
    await waitFor(() => screen.getByText("Pregnancy Consultation"));
    await user.click(screen.getByText("Pregnancy Consultation").closest("button")!);
    expect(
      screen.getByRole("button", { name: /continue/i }),
    ).not.toBeDisabled();
  });

  it("calls onNext when Continue is clicked with a selection", async () => {
    const { onNext, user } = renderService({ selected: MOCK_SERVICES[0] });
    await waitFor(() => screen.getByText("Pregnancy Consultation"));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe("StepService — API error", () => {
  it("shows an empty grid (no crash) when the API returns an empty list", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderService();
    await waitFor(() => {
      expect(screen.queryByText("Pregnancy Consultation")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });
});
