import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, waitFor, fireEvent } from "@/__tests__/utils";
import ScenarioPage from "@/app/(main)/scenario/[slug]/page";

vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ slug: "transportation" })),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/scenario/transportation",
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("04 — Scenario Page", () => {
  it("shows skeleton loader while content loads", () => {
    renderWithProviders(<ScenarioPage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders scenario header with correct title", async () => {
    renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      const heading = screen.getByRole("heading", { name: /transportation/i });
      expect(heading).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("shows experience from the selected level (B1)", async () => {
    renderWithProviders(<ScenarioPage />);

    // Saved level is B1 → Platform Changes should be visible
    await waitFor(() => {
      expect(screen.getByText("Platform Changes")).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("has per-scenario CEFR level dropdown showing B1", async () => {
    renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      expect(screen.getByText("Platform Changes")).toBeInTheDocument();
    }, { timeout: 5000 });

    const levelDropdown = screen.getByRole("button", { name: /B1/i });
    expect(levelDropdown).toBeInTheDocument();
  });

  it("shows CEFR info banner", async () => {
    renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      expect(screen.getByText(/Learn at your own comfort/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("can change CEFR level via dropdown", async () => {
    renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      expect(screen.getByText("Platform Changes")).toBeInTheDocument();
    }, { timeout: 5000 });

    const levelButton = screen.getByRole("button", { name: /B1/i });
    fireEvent.click(levelButton);

    const option = await screen.findByText("B2");
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /B2/i })).toBeInTheDocument();
    });
  });

  it("shows experience with crown icon and XP badge after progress loads", async () => {
    renderWithProviders(<ScenarioPage />);

    // Wait for the XP badge to appear (indicates batch progress loaded)
    await waitFor(() => {
      expect(screen.getByText(/50 XP/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    expect(screen.getByText("Platform Changes")).toBeInTheDocument();
    expect(screen.getByText("6:00")).toBeInTheDocument();
  });
});
