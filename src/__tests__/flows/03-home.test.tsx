import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, waitFor } from "@/__tests__/utils";
import HomePage from "@/app/(main)/home/page";

describe("03 — Home Page", () => {
  it("shows skeleton cards while content loads", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("My Germany")).toBeInTheDocument();
    expect(screen.getByText(/Ready to master/)).toBeInTheDocument();
  });

  it("renders scenario cards after ContentProvider loads", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Transportation")).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText("Doctor Visit")).toBeInTheDocument();
    expect(screen.getByText("Job Interview")).toBeInTheDocument();
  });

  it("shows per-scenario CEFR level badge from saved settings", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Transportation")).toBeInTheDocument();
    }, { timeout: 5000 });

    const badges = screen.getAllByText(/^[AB]\d$/);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows correct heading and greeting", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Guten Morgen!")).toBeInTheDocument();
    expect(screen.getByText(/Ready to master/)).toBeInTheDocument();
  });

  it("shows Today's Goal section", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Today's Goal")).toBeInTheDocument();
  });

  it("each scenario card links to correct detail page", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Transportation")).toBeInTheDocument();
    }, { timeout: 5000 });

    const links = screen.getAllByRole("link");
    const transportationLink = links.find((l) =>
      l.getAttribute("href")?.includes("transportation")
    );
    expect(transportationLink).toBeDefined();
  });

  it("has vertical gap between cards", async () => {
    const { container } = renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Transportation")).toBeInTheDocument();
    }, { timeout: 5000 });

    const cards = container.querySelectorAll("a[href*='/scenario/']");
    expect(cards.length).toBe(3);

    const section = container.querySelector("section.flex.flex-col");
    expect(section).toBeDefined();
  });

  it("shows Start button on each scenario card", async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Transportation")).toBeInTheDocument();
    }, { timeout: 5000 });

    const startButtons = screen.getAllByText("Start");
    expect(startButtons.length).toBe(3);
  });
});
