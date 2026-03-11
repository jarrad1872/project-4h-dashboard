import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to reset the module between tests to clear the in-memory store
let checkRateLimit: typeof import("../rate-limit").checkRateLimit;
let rateLimitKey: typeof import("../rate-limit").rateLimitKey;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("../rate-limit");
  checkRateLimit = mod.checkRateLimit;
  rateLimitKey = mod.rateLimitKey;
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const result = checkRateLimit("test-key", { limit: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfterMs).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const opts = { limit: 2, windowMs: 60_000 };
    checkRateLimit("test-key", opts);
    checkRateLimit("test-key", opts);
    const result = checkRateLimit("test-key", opts);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    checkRateLimit("key-a", opts);
    const result = checkRateLimit("key-b", opts);
    expect(result.allowed).toBe(true);
  });

  it("decrements remaining correctly", () => {
    const opts = { limit: 5, windowMs: 60_000 };
    expect(checkRateLimit("key", opts).remaining).toBe(4);
    expect(checkRateLimit("key", opts).remaining).toBe(3);
    expect(checkRateLimit("key", opts).remaining).toBe(2);
  });
});

describe("rateLimitKey", () => {
  it("uses token prefix for Bearer auth", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { Authorization: "Bearer my-secret-token-123" },
    });
    const key = rateLimitKey(req);
    expect(key).toBe("token:my-secret-tok");
  });

  it("uses X-Forwarded-For for unauthenticated requests", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "X-Forwarded-For": "1.2.3.4" },
    });
    const key = rateLimitKey(req);
    expect(key).toBe("origin:1.2.3.4");
  });

  it("uses 'unknown' when no identifying headers", () => {
    const req = new Request("http://localhost/api/test");
    const key = rateLimitKey(req);
    expect(key).toBe("origin:unknown");
  });
});
