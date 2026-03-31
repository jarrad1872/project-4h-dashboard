import { headers } from "next/headers";
import { ApprovalClient } from "./approval-client";
import type { Ad } from "@/lib/types";

async function getInitialAds() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) return [];

  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const cookie = headerStore.get("cookie");
  const response = await fetch(`${protocol}://${host}/api/ads`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });

  if (!response.ok) return [];

  return response.json() as Promise<Ad[]>;
}

export default async function ApprovalPage() {
  const initialAds = await getInitialAds();
  return <ApprovalClient initialAds={initialAds} />;
}
