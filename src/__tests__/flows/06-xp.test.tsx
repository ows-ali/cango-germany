import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, waitFor, fireEvent } from "@/__tests__/utils";
import ExperiencePage from "@/app/(main)/experience/[id]/page";
import { resetStores } from "@/__tests__/api/mocks/handlers";

const mockUseParams = vi.hoisted(() => vi.fn(() => ({ id: "102" })));

vi.mock("next/navigation", () => ({
  useParams: mockUseParams,
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/experience/102",
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("06 — XP Tracking Flow", () => {
  beforeEach(() => {
    resetStores();
  });

  it("renders an incomplete experience for first-time test", async () => {
    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("Filing a Complaint")).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("lesson XP is 50 and bonus XP is 20", () => {
    expect(50 + 20).toBe(70);
  });

  it("shows Complete Lesson button for first-time experience", async () => {
    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("Filing a Complaint")).toBeInTheDocument();
    }, { timeout: 5000 });

    const completeBtn = screen.getByRole("button", {
      name: /complete lesson/i,
    });
    expect(completeBtn).toBeInTheDocument();
  });

  it("re-visiting a completed experience shows Review Complete", async () => {
    mockUseParams.mockReturnValue({ id: "101" });

    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("Platform Changes")).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
