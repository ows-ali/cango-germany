import "@testing-library/jest-dom/vitest";
import { setupServer } from "msw/node";
import { handlers, resetStores } from "./api/mocks/handlers";
import { beforeAll, afterEach, afterAll, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({
    data: {
      user: { id: "test-user-1", email: "test@example.com", name: "Test User" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    },
    status: "authenticated",
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({})),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  resetStores();
});
afterAll(() => server.close());
