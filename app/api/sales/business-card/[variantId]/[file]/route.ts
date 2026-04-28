import QRCode from "qrcode";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildSalesTrackingUrl,
  businessCardPrintSpec,
  getSalesCardVariant,
  getSalesRep,
  SALES_CARD_PRICE,
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

async function publicAssetDataUrl(relativePath: string, mimeType: string) {
  const file = path.join(process.cwd(), "public", relativePath);
  const bytes = await readFile(file);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
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
  const [pipeIcon, pipeHero] = await Promise.all([
    publicAssetDataUrl("sales-assets/pipe-512.png", "image/png"),
    publicAssetDataUrl("sales-assets/pipe-hero.jpg", "image/jpeg"),
  ]);

  const width = businessCardPrintSpec.pixelSize.width;
  const height = businessCardPrintSpec.pixelSize.height;
  const commonDefs = `
    <defs>
      <linearGradient id="trust" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#14181C"/>
        <stop offset="1" stop-color="#232A31"/>
      </linearGradient>
      <linearGradient id="dark" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#0B0D0F"/>
        <stop offset="0.58" stop-color="#14181C"/>
        <stop offset="1" stop-color="#1A1F24"/>
      </linearGradient>
      <style>
        .brandDark { font: 900 64px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .brandLight { font: 900 64px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .brandQr { font: 900 54px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .kickerDark { font: 800 20px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 2px; }
        .kickerLight { font: 800 20px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 2px; }
        .headlineDark { font: 900 42px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .headlineLight { font: 900 48px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .subDark { font: 600 24px Geist, Arial, Helvetica, sans-serif; fill: #9BA4AD; letter-spacing: 0; }
        .subLight { font: 600 24px Geist, Arial, Helvetica, sans-serif; fill: #9BA4AD; letter-spacing: 0; }
        .smallDark { font: 800 21px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .smallLight { font: 800 21px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .fineDark { font: 600 17px Geist, Arial, Helvetica, sans-serif; fill: #9BA4AD; letter-spacing: 0; }
        .fineLight { font: 600 17px Geist, Arial, Helvetica, sans-serif; fill: #9BA4AD; letter-spacing: 0; }
        .price { font: 900 34px Geist, Arial, Helvetica, sans-serif; fill: #0B0D0F; letter-spacing: 0; }
        .offer { font: 800 21px Geist, Arial, Helvetica, sans-serif; fill: #0B0D0F; letter-spacing: 0; }
        .bulletDark { font: 800 24px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .bulletLight { font: 800 24px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
      </style>
    </defs>`;

  const offerLockup = (x: number, y: number) => `
    <rect x="${x}" y="${y}" width="482" height="86" rx="10" fill="#F5C518"/>
    ${textLine(SALES_CARD_PRICE, x + 28, y + 45, "price")}
    ${textLine("14-day free trial", x + 168, y + 41, "offer")}
    ${textLine("No credit card required.", x + 168, y + 66, "offer")}`;

  if (variant.id === "dustin-pipe-missed-call") {
    if (side === "front") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city missed-call card front">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="url(#dark)"/>
  <image href="${pipeHero}" x="670" y="0" width="455" height="675" preserveAspectRatio="xMidYMid slice" opacity="0.36"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="#0B0D0F" opacity="0.34"/>
  <image href="${pipeIcon}" x="76" y="76" width="86" height="86"/>
  ${textLine("pipe.city", 180, 136, "brandLight")}
  ${textLine("ARIZONA PLUMBING PROOF SPRINT", 82, 198, "kickerLight")}
  ${textLine("Missed call", 82, 295, "headlineLight")}
  ${textLine("= missed job.", 82, 356, "headlineLight")}
  ${textLine("AI Agent answers urgent calls while you keep working.", 84, 414, "subLight")}
  ${offerLockup(82, 468)}
  ${textLine(`${rep.name}  |  ${rep.phone}  |  ${rep.email}`, 84, 615, "smallLight")}
</svg>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city missed-call card back">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="#0B0D0F"/>
  <rect x="72" y="72" width="612" height="522" rx="14" fill="#14181C" stroke="#2A3138"/>
  ${textLine("Your AI Agent", 106, 137, "headlineLight")}
  ${textLine("for plumbing calls.", 106, 193, "headlineLight")}
  ${variant.backBullets.map((bullet, index) => textLine(`${index + 1}. ${bullet}`, 118, 286 + index * 64, "bulletLight")).join("\n  ")}
  ${textLine(rep.name, 110, 520, "smallLight")}
  ${textLine(`${rep.role}  |  ${rep.phone}  |  ${rep.email}`, 110, 555, "fineLight")}
  <rect x="756" y="104" width="292" height="292" rx="14" fill="#ffffff"/>
  <image href="${qrDataUrl}" x="792" y="140" width="220" height="220"/>
  ${textLine("Scan for live demo", 902, 426, "smallLight", "middle")}
  ${textLine("pipe.city", 902, 504, "brandQr", "middle")}
  <rect x="764" y="530" width="284" height="50" rx="10" fill="#F5C518"/>
  ${textLine("Built for urgent calls", 906, 562, "offer", "middle")}
</svg>`;
  }

  if (variant.id === "dustin-pipe-live-demo") {
    if (side === "front") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city live demo card front">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="#0B0D0F"/>
  <rect x="58" y="58" width="408" height="560" rx="14" fill="#14181C" stroke="#2A3138"/>
  <rect x="114" y="111" width="296" height="296" rx="14" fill="#ffffff" stroke="#F5C518" stroke-width="8"/>
  <image href="${qrDataUrl}" x="152" y="149" width="220" height="220"/>
  ${textLine("SCAN FOR", 262, 465, "kickerDark", "middle")}
  ${textLine("LIVE DEMO", 262, 516, "headlineDark", "middle")}
  <image href="${pipeIcon}" x="686" y="76" width="96" height="96"/>
  ${textLine("pipe.city", 800, 145, "brandDark")}
  ${textLine("Hear the AI Agent", 586, 235, "headlineDark")}
  ${textLine("answer the call.", 586, 286, "headlineDark")}
  ${textLine("Answers call  |  Texts owner  |  Captures job", 590, 333, "subDark")}
  ${offerLockup(586, 392)}
  ${textLine(rep.name, 590, 532, "smallDark")}
  ${textLine(`${rep.role}  |  ${rep.phone}  |  ${rep.email}`, 590, 566, "fineDark")}
</svg>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city live demo card back">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="url(#dark)"/>
  <image href="${pipeHero}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="0.22"/>
  <rect x="68" y="68" width="989" height="539" rx="14" fill="#0B0D0F" opacity="0.86"/>
  ${textLine("AI Agent built for solo", 108, 159, "headlineLight")}
  ${textLine("plumbing owners.", 108, 217, "headlineLight")}
  ${variant.backBullets.map((bullet, index) => textLine(`${index + 1}. ${bullet}`, 126, 319 + index * 62, "bulletLight")).join("\n  ")}
  ${textLine(`${rep.name}  |  ${rep.phone}  |  ${rep.email}`, 110, 555, "smallLight")}
  <rect x="790" y="146" width="240" height="240" rx="14" fill="#ffffff"/>
  <image href="${qrDataUrl}" x="800" y="156" width="220" height="220"/>
  ${textLine("pipe.city", 910, 449, "brandLight", "middle")}
  ${textLine("14-day free trial, no credit card", 910, 496, "smallLight", "middle")}
</svg>`;
  }

  if (side === "front") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city local trust card front">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="url(#trust)"/>
  <path d="M840 92 L985 92 L1035 218 L998 346 L1048 492 L925 592 L752 516 L705 336 Z" fill="#F5C518" opacity="0.10"/>
  <rect x="0" y="0" width="22" height="${height}" fill="#F5C518"/>
  <image href="${pipeIcon}" x="76" y="76" width="104" height="104"/>
  ${textLine("pipe.city", 204, 146, "brandDark")}
  ${textLine("ARIZONA PLUMBING EARLY TESTER ROUTE", 82, 224, "kickerDark")}
  ${textLine(rep.name, 82, 327, "headlineDark")}
  ${textLine(rep.role, 84, 378, "subDark")}
  ${textLine(rep.phone, 84, 428, "headlineDark")}
  ${textLine(rep.email, 84, 472, "smallDark")}
  ${textLine("AI Agent answers plumbing calls when you cannot.", 84, 525, "smallDark")}
  ${textLine("Local help. Live demo. No pressure.", 84, 548, "fineDark")}
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city local trust card back">
  ${commonDefs}
  <rect width="${width}" height="${height}" fill="#0B0D0F"/>
  <rect x="0" y="0" width="${width}" height="22" fill="#F5C518"/>
  ${textLine("Let pipe.city catch", 75, 100, "headlineDark")}
  ${textLine("the next urgent call.", 75, 153, "headlineDark")}
  ${variant.backBullets.map((bullet, index) => textLine(`${index + 1}. ${bullet}`, 94, 205 + index * 58, "bulletDark")).join("\n  ")}
  ${offerLockup(76, 410)}
  <rect x="780" y="110" width="270" height="270" rx="14" fill="#ffffff" stroke="#F5C518" stroke-width="6"/>
  <image href="${qrDataUrl}" x="805" y="135" width="220" height="220"/>
  ${textLine("Scan for live demo", 915, 426, "smallDark", "middle")}
  ${textLine("pipe.city", 915, 504, "brandQr", "middle")}
  ${textLine(`${rep.name}  |  ${rep.phone}  |  ${rep.email}`, 75, 594, "fineDark")}
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
