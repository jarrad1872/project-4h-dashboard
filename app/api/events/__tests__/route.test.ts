import { afterEach, describe, expect, it } from "vitest";
import { POST } from "../route";

describe("POST /api/events", () => {
  const originalToken = process.env.PUMPCANS_API_TOKEN;

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.PUMPCANS_API_TOKEN;
    } else {
      process.env.PUMPCANS_API_TOKEN = originalToken;
    }
  });

  it("rejects unauthenticated ingestion even when the body is valid", async () => {
    process.env.PUMPCANS_API_TOKEN = "test-token";

    const response = await POST(new Request("http://localhost/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "demo_call", trade_slug: "pipe" }),
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });
});
