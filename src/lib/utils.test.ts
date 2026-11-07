import { describe, expect, it } from "vitest";
import { cn } from "./utils";
import { getStatusBadgeColor } from "@/components/requests/utils/status";

describe("cn", () => {
  it("merges conflicting tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("getStatusBadgeColor", () => {
  it("maps known statuses", () => {
    expect(getStatusBadgeColor("COMPLETED")).toBe("bg-green-500");
  });
});
