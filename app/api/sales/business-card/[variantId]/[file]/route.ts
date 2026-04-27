import QRCode from "qrcode";
import {
  buildSalesTrackingUrl,
  businessCardPrintSpec,
  getSalesCardVariant,
  getSalesRep,
  SALES_CARD_PRICE,
  SALES_CARD_TRIAL,
} from "@/lib/sales-rep-pipeline";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CardSide = "front" | "back";
type CardFormat = "svg" | "png";

function parseFile(file: string): { side: CardSide; format: CardFormat } | null {
  const match = /^(front|back)\.(svg|png)$/.exec(file);
  if (!match) return null;
  return { side: match[1] as CardSide, format: match[2] as CardFormat };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function textLine(value: string, x: number, y: number, className: string, anchor = "start") {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${className}">${escapeXml(value)}</text>`;
}

async function buildCardSvg(variantId: string, side: CardSide) {
  const variant = getSalesCardVariant(variantId);
  if (!variant) return null;

  const rep = getSalesRep(variant.repId);
  if (!rep) return null;

  const tracking = buildSalesTrackingUrl({ rep, cardVariant: variant, physicalCardId: `${variant.id}-master` });
  const qrDataUrl = await QRCode.toDataURL(tracking.url, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 220,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  const width = businessCardPrintSpec.pixelSize.width;
  const height = businessCardPrintSpec.pixelSize.height;
  const commonDefs = `
    <defs>
      <linearGradient id="az" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0f172a"/>
        <stop offset="0.48" stop-color="#123047"/>
        <stop offset="1" stop-color="#14532d"/>
      </linearGradient>
      <linearGradient id="warm" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#f59e0b"/>
        <stop offset="0.5" stop-color="#22c55e"/>
        <stop offset="1" stop-color="#06b6d4"/>
      </linearGradient>
      <style>
        .brand { font: 800 58px Arial, Helvetica, sans-serif; fill: #ffffff; letter-spacing: 0; }
        .kicker { font: 700 20px Arial, Helvetica, sans-serif; fill: #67e8f9; letter-spacing: 2px; }
        .headline { font: 800 42px Arial, Helvetica, sans-serif; fill: #ffffff; letter-spacing: 0; }
        .subhead { font: 500 25px Arial, Helvetica, sans-serif; fill: #cbd5e1; letter-spacing: 0; }
        .small { font: 700 20px Arial, Helvetica, sans-serif; fill: #e2e8f0; letter-spacing: 0; }
        .fine { font: 500 17px Arial, Helvetica, sans-serif; fill: #94a3b8; letter-spacing: 0; }
        .price { font: 900 34px Arial, Helvetica, sans-serif; fill: #0f172a; letter-spacing: 0; }
        .offer { font: 800 21px Arial, Helvetica, sans-serif; fill: #0f172a; letter-spacing: 0; }
        .bullet { font: 700 25px Arial, Helvetica, sans-serif; fill: #ffffff; letter-spacing: 0; }
      </style>
    </defs>`;

  if (side === "front") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Answered.City Arizona field sales business card front">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="url(#az)"/>
  <path d="M0 588 C210 545 310 633 512 591 C726 546 832 564 1125 492 L1125 675 L0 675 Z" fill="#020617" opacity="0.42"/>
  <rect x="75" y="76" width="975" height="523" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2"/>
  <rect x="75" y="75" width="310" height="8" fill="url(#warm)"/>
  ${textLine("ANSWERED.CITY", 75, 150, "brand")}
  ${textLine("AI PHONE REP FOR TRADE OWNERS", 80, 198, "kicker")}
  ${textLine("Never miss the call", 75, 289, "headline")}
  ${textLine("that becomes the next job.", 75, 341, "headline")}
  ${textLine("Answers, qualifies, and routes jobs while the crew is working.", 80, 399, "subhead")}
  <rect x="78" y="432" width="468" height="88" rx="18" fill="#ecfccb"/>
  ${textLine(SALES_CARD_PRICE, 108, 477, "price")}
  ${textLine(SALES_CARD_TRIAL, 248, 477, "offer")}
  ${textLine("No setup call required to start.", 108, 504, "offer")}
  <rect x="798" y="118" width="244" height="244" rx="24" fill="#ffffff"/>
  <image href="${qrDataUrl}" x="810" y="130" width="220" height="220"/>
  ${textLine("Scan to try it", 920, 399, "small", "middle")}
  ${textLine("answered.city", 920, 433, "small", "middle")}
  ${textLine(`Rep code: ${rep.code}`, 920, 468, "fine", "middle")}
  ${textLine("Arizona early tester route", 75, 565, "fine")}
</svg>`;
  }

  const domains = rep.focusTrades.join("  |  ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Answered.City Arizona field sales business card back">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="#020617"/>
  <rect x="0" y="0" width="${width}" height="18" fill="url(#warm)"/>
  <circle cx="965" cy="120" r="92" fill="#f59e0b" opacity="0.22"/>
  <circle cx="1018" cy="166" r="55" fill="#06b6d4" opacity="0.20"/>
  ${textLine(variant.backHeadline, 75, 115, "headline")}
  ${textLine("For plumbers, HVAC, lawn care, pest control, and painters.", 78, 166, "subhead")}
  <rect x="75" y="215" width="645" height="248" rx="24" fill="#0f172a" stroke="#334155"/>
  ${variant.backBullets.map((bullet, index) => textLine(`${index + 1}. ${bullet}`, 112, 277 + index * 64, "bullet")).join("\n  ")}
  <rect x="766" y="215" width="284" height="248" rx="24" fill="#ffffff"/>
  <image href="${qrDataUrl}" x="798" y="247" width="220" height="220"/>
  ${textLine("Track this card", 908, 503, "small", "middle")}
  ${textLine(`Code ${rep.code}`, 908, 535, "fine", "middle")}
  <rect x="75" y="494" width="645" height="76" rx="16" fill="#ecfccb"/>
  ${textLine(SALES_CARD_PRICE, 105, 538, "price")}
  ${textLine(SALES_CARD_TRIAL, 245, 532, "offer")}
  ${textLine("No credit card required.", 245, 558, "offer")}
  ${textLine(domains, 75, 614, "fine")}
</svg>`;
}

export async function GET(_request: Request, context: { params: Promise<{ variantId: string; file: string }> }) {
  const { variantId, file } = await context.params;
  const parsed = parseFile(file);

  if (!parsed) {
    return new Response("Use front.svg, back.svg, front.png, or back.png", { status: 400 });
  }

  const svg = await buildCardSvg(variantId, parsed.side);
  if (!svg) {
    return new Response("Sales card variant not found", { status: 404 });
  }

  if (parsed.format === "svg") {
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const sharp = (await import("sharp")).default;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
