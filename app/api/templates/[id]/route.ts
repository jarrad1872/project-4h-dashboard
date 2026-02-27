import { errorJson, okJson, optionsResponse } from "@/lib/api";
import { DataFiles, writeJsonFile } from "@/lib/file-db";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabase, logActivity, normalizeTemplate, readFallback } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

function readTemplatesFallback() {
  return readFallback<unknown[]>(DataFiles.templates, []).map(normalizeTemplate);
}

function isMissingTemplatesTable(error: { code?: string; message?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message?.includes("ad_templates") ||
        error.message?.includes("schema cache")),
  );
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!hasSupabase()) {
      const templates = readTemplatesFallback();
      const toDelete = templates.find((item) => item.id === id);
      if (!toDelete) {
        return errorJson("Template not found", 404);
      }

      writeJsonFile(
        DataFiles.templates,
        templates.filter((item) => item.id !== id),
      );

      await logActivity({
        entity_type: "template",
        entity_id: id,
        action: "deleted",
        old_value: toDelete,
      });

      return okJson({ ok: true });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("ad_templates")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (existingError) {
      if (isMissingTemplatesTable(existingError)) {
        const templates = readTemplatesFallback();
        const toDelete = templates.find((item) => item.id === id);
        if (!toDelete) {
          return errorJson("Template not found", 404);
        }

        writeJsonFile(
          DataFiles.templates,
          templates.filter((item) => item.id !== id),
        );

        await logActivity({
          entity_type: "template",
          entity_id: id,
          action: "deleted",
          old_value: toDelete,
        });

        return okJson({ ok: true });
      }

      return errorJson("Failed to load template", 500, existingError.message);
    }

    if (!existing) {
      return errorJson("Template not found", 404);
    }

    const { error } = await supabaseAdmin.from("ad_templates").delete().eq("id", id);
    if (error) {
      if (isMissingTemplatesTable(error)) {
        const templates = readTemplatesFallback();
        writeJsonFile(
          DataFiles.templates,
          templates.filter((item) => item.id !== id),
        );
      } else {
        return errorJson("Failed to delete template", 500, error.message);
      }
    }

    await logActivity({
      entity_type: "template",
      entity_id: id,
      action: "deleted",
      old_value: normalizeTemplate(existing),
    });

    return okJson({ ok: true });
  } catch (error) {
    return errorJson("Failed to delete template", 500, String(error));
  }
}
