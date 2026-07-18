import { describe, it, expect, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  fireEvent,
} from "@/__tests__/utils";
import ExperiencePage from "@/app/(main)/experience/[id]/page";

vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ id: "100" })),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/experience/100",
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("05 — Experience Player (review mode)", () => {
  it("shows skeleton while content loads", () => {
    renderWithProviders(<ExperiencePage />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders lesson content after loading", async () => {
    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("At the Ticket Machine")).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("shows Review badge in header for completed experience", async () => {
    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("At the Ticket Machine")).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText(/Review/i)).toBeInTheDocument();
  });

  it("has audio play button", async () => {
    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("At the Ticket Machine")).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find the play button by icon text
    const buttons = screen.getAllByRole("button");
    const playBtn = buttons.find(
      (b) => b.textContent && b.textContent.includes("play_arrow")
    );
    expect(playBtn).toBeInTheDocument();
  });

  it("renders MCQ question", async () => {
    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("At the Ticket Machine")).toBeInTheDocument();
    }, { timeout: 5000 });

    const mcqQuestion = screen.getByText(/what does "Fahrkarte" mean/i);
    expect(mcqQuestion).toBeInTheDocument();
  });

  it("shows completed state — button does not say 'Complete Lesson'", async () => {
    renderWithProviders(<ExperiencePage />);

    await waitFor(() => {
      expect(screen.getByText("At the Ticket Machine")).toBeInTheDocument();
    }, { timeout: 5000 });

    // Experience 100 is fully completed → Complete Lesson button should not appear
    await waitFor(() => {
      const lessonBtn = screen.queryByRole("button", {
        name: /complete lesson/i,
      });
      expect(lessonBtn).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
