import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://pumpcans.com",
  "http://localhost:3000",
];

export function getCorsOrigin(request?: Request): string {
  const origin = request?.headers.get("Origin") ?? "";
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export function corsHeaders(request?: Request) {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(request),
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

export function okJson(data: unknown, status = 200, request?: Request) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(request),
  });
}

export function errorJson(message: string, status = 500, details?: unknown, request?: Request) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status, headers: corsHeaders(request) },
  );
}

export function optionsResponse(request?: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
