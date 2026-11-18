/**
 * Usernames a creator may never register (#387).
 *
 * Creator profiles live at `/[username]`, next to the static routes under
 * `frontend/app` — `/dashboard`, `/settings`, `/admin`, etc. A creator who
 * claims one of those names gets a profile the static route always wins
 * over, so it can never be reached, and names like `admin` or `support`
 * would let anyone impersonate the platform.
 *
 * This list is the single shared source of truth: every top-level route
 * under `frontend/app` (skipping the `[username]` catch-all itself and the
 * `__tests__` directory, which isn't a route) plus a few platform-sounding
 * names that aren't routes but would still read as official. Keep it in
 * sync with `frontend/app` by hand — `reservedUsernames.test.ts` fails if a
 * new top-level directory shows up there without being added here.
 */
const FRONTEND_APP_ROUTES = [
  "activity",
  "admin",
  "api",
  "app",
  "auth",
  "dashboard",
  "discover",
  "donate",
  "leaderboard",
  "receipt",
  "settings",
];

const PLATFORM_NAMES = [
  "support",
  "supportme",
  "support-me",
  "security",
  "help",
  "about",
  "contact",
  "terms",
  "privacy",
  "monitoring",
  "status",
  "blog",
  "root",
  "null",
  "undefined",
];

export const RESERVED_USERNAMES = new Set(
  [...FRONTEND_APP_ROUTES, ...PLATFORM_NAMES].map((name) => name.toLowerCase())
);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}
