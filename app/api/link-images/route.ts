/**
 * Link ad creatives to ads via image_url
 *
 * GET  /api/link-images  — returns count of ads with/without image_url
 * POST /api/link-images  — runs the linking logic (template → ad by platform)
 */
import { okJson, errorJson, optionsResponse } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

/** GET — return counts of ads with image_url set vs null */
export async function GET() {
  try {
    // Count ads with image_url set
    const { count: withImage, error: e1 } = await supabaseAdmin
      .from("ads")
      .select("id", { count: "exact", head: true })
      .not("image_url", "is", null);

    if (e1) {
      // Column may not exist yet — return a helpful message
      if (e1.code === "42703") {
        return okJson({
          status: "column_missing",
          message:
            "image_url column does not exist yet. POST /api/migrate to create it.",
          withImage: 0,
          withoutImage: 0,
          total: 0,
        });
      }
      return errorJson(e1.message, 500);
    }

    const { count: withoutImage, error: e2 } = await supabaseAdmin
      .from("ads")
      .select("id", { count: "exact", head: true })
      .is("image_url", null);

    if (e2) return errorJson(e2.message, 500);

    return okJson({
      status: "ok",
      withImage: withImage ?? 0,
      withoutImage: withoutImage ?? 0,
      total: (withImage ?? 0) + (withoutImage ?? 0),
    });
  } catch (err) {
    return errorJson("Unexpected error", 500, String(err));
  }
}

/** POST — run the linking logic */
export async function POST() {
  try {
    // 1. Fetch all ad_templates
    const { data: templates, error: tErr } = await supabaseAdmin
      .from("ad_templates")
      .select("*");

    if (tErr) return errorJson(tErr.message, 500);
    if (!templates?.length) return errorJson("No ad_templates found", 404);

    // 2. Build platform → imageUrl map using "saw" brand (Saw.City = concrete cutting)
    const platformImageMap: Record<string, string> = {};
    for (const t of templates) {
      let meta: Record<string, string> = {};
      try {
        meta = JSON.parse(t.utm_campaign ?? "{}");
      } catch {
        continue;
      }
      const imageUrl: string | undefined = meta.image_url;
      if (!imageUrl) continue;

      const brand = (t.name as string).split("-")[0]; // "saw", "rinse", "mow", "rooter"
      const platform: string = t.platform;

      if (brand === "saw") {
        platformImageMap[platform] = imageUrl;
      }
    }

    // 3. Fetch all ads without image_url
    const { data: ads, error: aErr } = await supabaseAdmin
      .from("ads")
      .select("id,platform,image_url");

    if (aErr) {
      if (aErr.code === "42703") {
        return errorJson(
          "image_url column does not exist. Run POST /api/migrate first.",
          500
        );
      }
      return errorJson(aErr.message, 500);
    }

    let matched = 0;
    let skipped = 0;
    let alreadySet = 0;

    // 4. Link each ad to its matching template image
    for (const ad of ads ?? []) {
      if (ad.image_url) {
        alreadySet++;
        continue;
      }

      const imageUrl = platformImageMap[ad.platform as string];
      if (!imageUrl) {
        skipped++;
        continue;
      }

      const { error: pErr } = await supabaseAdmin
        .from("ads")
        .update({ image_url: imageUrl })
        .eq("id", ad.id);

      if (pErr) {
        console.error(`Failed to update ad ${ad.id}:`, pErr.message);
        skipped++;
      } else {
        matched++;
      }
    }

    return okJson({
      status: "ok",
      alreadySet,
      matched,
      skipped,
      total: ads?.length ?? 0,
      platformMap: platformImageMap,
    });
  } catch (err) {
    return errorJson("Unexpected error", 500, String(err));
  }
}
