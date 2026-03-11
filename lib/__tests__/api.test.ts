import { describe, it, expect } from "vitest";
import { getCorsOrigin, corsHeaders, okJson, errorJson, optionsResponse } from "../api";

describe("getCorsOrigin", () => {
  it("returns pumpcans.com for allowed origin", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { Origin: "https://pumpcans.com" },
    });
    expect(getCorsOrigin(req)).toBe("https://pumpcans.com");
  });

  it("returns localhost for dev origin", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { Origin: "http://localhost:3000" },
    });
    expect(getCorsOrigin(req)).toBe("http://localhost:3000");
  });

  it("returns pumpcans.com (default) for unknown origin", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { Origin: "https://evil.com" },
    });
    expect(getCorsOrigin(req)).toBe("https://pumpcans.com");
  });

  it("returns pumpcans.com when no request provided", () => {
    expect(getCorsOrigin()).toBe("https://pumpcans.com");
  });
});

describe("corsHeaders", () => {
  it("includes Vary header", () => {
    const headers = corsHeaders();
    expect(headers["Vary"]).toBe("Origin");
  });

  it("includes DELETE in allowed methods", () => {
    const headers = corsHeaders();
    expect(headers["Access-Control-Allow-Methods"]).toContain("DELETE");
  });
});

describe("okJson", () => {
  it("returns 200 by default", () => {
    const res = okJson({ ok: true });
    expect(res.status).toBe(200);
  });

  it("returns custom status", () => {
    const res = okJson({ created: true }, 201);
    expect(res.status).toBe(201);
  });

  it("includes CORS headers", () => {
    const res = okJson({ ok: true });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });
});

describe("errorJson", () => {
  it("returns error body with message", async () => {
    const res = errorJson("Something broke", 500);
    const body = await res.json();
    expect(body.error).toBe("Something broke");
    expect(res.status).toBe(500);
  });

  it("includes details when provided", async () => {
    const res = errorJson("Failed", 400, "Missing field");
    const body = await res.json();
    expect(body.details).toBe("Missing field");
  });

  it("omits details when not provided", async () => {
    const res = errorJson("Failed", 400);
    const body = await res.json();
    expect(body.details).toBeUndefined();
  });
});

describe("optionsResponse", () => {
  it("returns 204 with CORS headers", () => {
    const res = optionsResponse();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeTruthy();
  });
});
