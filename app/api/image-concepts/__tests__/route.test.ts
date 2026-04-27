import { describe, expect, it } from "vitest";
import { GET } from "../route";
import { POST } from "../route";

describe("GET /api/image-concepts", () => {
  it("returns filtered ChatGPT image briefs", async () => {
    const response = await GET(new Request("http://localhost/api/image-concepts?trade_slug=pipe&angle=demo-call"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.model).toBe("chatgpt-image-latest");
    expect(body.provider).toBe("chatgpt-pro");
    expect(body.briefs).toHaveLength(1);
    expect(body.briefs[0].id).toBe("pipe-demo-call-multi");
    expect(body.briefs[0].prompt).toContain("pipe.city");
  });
});

describe("POST /api/image-concepts", () => {
  it("returns 400 for unknown trades", async () => {
    const response = await POST(new Request("http://localhost/api/image-concepts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trade_slug: "unknown", angle: "demo-call", target_platform: "multi" }),
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("trade_slug must be one of");
  });
});
