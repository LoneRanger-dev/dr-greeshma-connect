import "@testing-library/jest-dom";
import { vi, beforeAll } from "vitest";

// ── Browser API stubs (missing from jsdom) ─────────────────────────────────

beforeAll(() => {
  // matchMedia — used by framer-motion's useReducedMotion + CursorGlow
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:             false,
      media:               query,
      onchange:            null,
      addListener:         vi.fn(),
      removeListener:      vi.fn(),
      addEventListener:    vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent:       vi.fn(),
    })),
  });

  // IntersectionObserver — used by framer-motion's whileInView
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe:    vi.fn(),
    unobserve:  vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof IntersectionObserver;

  // ResizeObserver — used by some Radix UI primitives
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe:    vi.fn(),
    unobserve:  vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof ResizeObserver;
});

// ── Global Next.js module mocks ────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter:     vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() })),
  usePathname:   vi.fn(() => "/"),
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn:     vi.fn(),
  signOut:    vi.fn(),
}));
