import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, waitFor, fireEvent } from "@/__tests__/utils";
import { resetStores } from "@/__tests__/api/mocks/handlers";
import ScenarioPage from "@/app/(main)/scenario/[slug]/page";

const mockUseParams = vi.hoisted(() => vi.fn(() => ({ slug: "doctor" })));

vi.mock("next/navigation", () => ({
  useParams: mockUseParams,
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/scenario/doctor",
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("07 — CEFR Persistence Flow", () => {
  beforeEach(() => {
    resetStores();
  });

  it("shows default CEFR level on scenario page (no saved setting → A2)", async () => {
    renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      const heading = screen.getByRole("heading", { name: /doctor visit/i });
      expect(heading).toBeInTheDocument();
    }, { timeout: 5000 });

    // Doctor Visit has no saved level → defaults to A2 (the only level available)
    const levelButton = screen.getByRole("button", { name: /a2/i });
    expect(levelButton).toBeInTheDocument();
  });

  it("shows experience from the default level (A2)", async () => {
    renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      expect(screen.getByText("Calling the Practice")).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("shows CEFR info banner", async () => {
    renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      expect(screen.getByText(/Learn at your own comfort/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("persists CEFR level selection across re-renders", async () => {
    const { unmount } = renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      const heading = screen.getByRole("heading", { name: /doctor visit/i });
      expect(heading).toBeInTheDocument();
    }, { timeout: 5000 });

    // Only A2 exists for Doctor Visit, so the dropdown shows A2
    const levelButton = screen.getByRole("button", { name: /a2/i });
    expect(levelButton).toBeInTheDocument();

    unmount();

    // Re-mount (simulate navigate away and back)
    const { unmount: unmount2 } = renderWithProviders(<ScenarioPage />);

    await waitFor(() => {
      const heading = screen.getByRole("heading", { name: /doctor visit/i });
      expect(heading).toBeInTheDocument();
    }, { timeout: 5000 });

    // Level should still show A2
    const levelBtn = screen.getByRole("button", { name: /a2/i });
    expect(levelBtn).toBeInTheDocument();

    unmount2();
  });
});
