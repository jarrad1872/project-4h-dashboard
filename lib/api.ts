import { NextResponse } from "next/server";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function okJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export function errorJson(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status, headers: corsHeaders },
  );
}

export function optionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
