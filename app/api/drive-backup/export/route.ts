import { errorJson, optionsResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

function archivedResponse() {
  return errorJson("Drive CSV export has been archived from the active dashboard", 410);
}

export function GET() {
  return archivedResponse();
}

export function POST() {
  return archivedResponse();
}
