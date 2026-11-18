import fs from "fs";
import path from "path";
import { RESERVED_USERNAMES, isReservedUsername } from "../../lib/reservedUsernames";

// Directories under frontend/app that aren't routes a username could collide
// with: `[username]` is the dynamic catch-all the reserved list protects
// against, and `__tests__` is test infrastructure, not a page.
const NON_ROUTE_DIRS = new Set(["[username]", "__tests__"]);

function frontendAppTopLevelRoutes(): string[] {
  const frontendAppDir = path.resolve(__dirname, "../../../../frontend/app");
  return fs
    .readdirSync(frontendAppDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !NON_ROUTE_DIRS.has(entry.name))
    .map((entry) => entry.name);
}

describe("reserved usernames (#387)", () => {
  it("reserves every top-level route under frontend/app", () => {
    const routes = frontendAppTopLevelRoutes();
    expect(routes.length).toBeGreaterThan(0);

    const unreserved = routes.filter((route) => !isReservedUsername(route));
    expect(unreserved).toEqual([]);
  });

  it.each(["admin", "settings", "dashboard", "support", "supportme", "security", "help"])(
    "reserves %s",
    (name) => {
      expect(isReservedUsername(name)).toBe(true);
    }
  );

  it("is case-insensitive", () => {
    expect(isReservedUsername("Admin")).toBe(true);
    expect(isReservedUsername("SETTINGS")).toBe(true);
  });

  it("does not reserve an ordinary username", () => {
    expect(isReservedUsername("alice")).toBe(false);
    expect(isReservedUsername("a-real-creator_42")).toBe(false);
  });

  it("has no empty or duplicate-after-lowercasing entries", () => {
    const list = Array.from(RESERVED_USERNAMES);
    expect(list.every((name) => name === name.toLowerCase() && name.length > 0)).toBe(true);
    expect(new Set(list).size).toBe(list.length);
  });
});
