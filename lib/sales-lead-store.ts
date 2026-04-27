import { DataFiles, writeJsonFile } from "@/lib/file-db";
import {
  normalizeSalesLead,
  salesLeadToJson,
  salesLeads,
  type SalesLead,
} from "@/lib/sales-rep-pipeline";
import { readFallback } from "@/lib/server-utils";

export function readSalesLeadsFallback() {
  return readFallback<unknown[]>(DataFiles.salesLeads, salesLeads).map((row) =>
    normalizeSalesLead(row as Partial<SalesLead> & Record<string, unknown>),
  );
}

export function writeSalesLeadsFallback(leads: SalesLead[]) {
  writeJsonFile(DataFiles.salesLeads, leads.map(salesLeadToJson));
}
