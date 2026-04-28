import QRCode from "qrcode";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildSalesTrackingUrl,
  businessCardPrintSpec,
  getSalesCardVariant,
  getSalesRep,
  PIPE_CITY_DEMO_LINE,
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
  const pipeHero = await publicAssetDataUrl("sales-assets/pipe-hero.jpg", "image/jpeg");

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
        .brandDark { font: 900 72px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .brandLight { font: 900 72px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .brandQr { font: 900 54px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .kickerDark { font: 800 20px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 2px; }
        .kickerLight { font: 800 20px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 2px; }
        .headlineDark { font: 900 48px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .headlineLight { font: 900 58px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .heroHeadline { font: 900 72px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .demoNumber { font: 900 68px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 0; }
        .subDark { font: 700 26px Geist, Arial, Helvetica, sans-serif; fill: #D8DEE5; letter-spacing: 0; }
        .subLight { font: 700 26px Geist, Arial, Helvetica, sans-serif; fill: #D8DEE5; letter-spacing: 0; }
        .smallDark { font: 800 21px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .smallLight { font: 800 21px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .fineDark { font: 600 17px Geist, Arial, Helvetica, sans-serif; fill: #9BA4AD; letter-spacing: 0; }
        .fineLight { font: 600 17px Geist, Arial, Helvetica, sans-serif; fill: #9BA4AD; letter-spacing: 0; }
        .price { font: 900 34px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 0; }
        .offer { font: 800 21px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .offerDark { font: 900 21px Geist, Arial, Helvetica, sans-serif; fill: #0B0D0F; letter-spacing: 0; }
        .bulletDark { font: 800 25px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .bulletLight { font: 800 25px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
      </style>
    </defs>`;

  const heroBase = (opacity = 0.7) => `
    <rect width="${width}" height="${height}" fill="#0B0D0F"/>
    <image href="${pipeHero}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}"/>
    <rect x="0" y="0" width="${width}" height="${height}" fill="#0B0D0F" opacity="0.28"/>`;

  const yellowRule = (x: number, y: number, ruleWidth = 132) => `
    <line x1="${x}" y1="${y}" x2="${x + ruleWidth}" y2="${y}" stroke="#F5C518" stroke-width="8" stroke-linecap="round"/>`;

  const repLine = (x: number, y: number, className = "smallLight") =>
    textLine(`${rep.name}  |  ${rep.phone}  |  ${rep.email}`, x, y, className);

  const offerLine = (x: number, y: number, className = "offer") =>
    textLine(`${SALES_CARD_PRICE}  |  ${SALES_CARD_TRIAL}`, x, y, className);

  const demoLine = (x: number, y: number, className = "demoNumber") => textLine(PIPE_CITY_DEMO_LINE, x, y, className);

  if (variant.id === "dustin-pipe-missed-call") {
    if (side === "front") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city missed-call card front">
  ${commonDefs}
  ${heroBase(0.76)}
  ${textLine("pipe.city", 74, 116, "brandLight")}
  ${yellowRule(78, 152, 112)}
  ${textLine("Missed call", 78, 284, "heroHeadline")}
  ${textLine("= missed job.", 78, 360, "heroHeadline")}
  ${textLine("AI Agent answers while you're on the job.", 82, 420, "subLight")}
  ${textLine("Demo line", 82, 502, "kickerLight")}
  ${demoLine(82, 575)}
  ${repLine(82, 628, "smallLight")}
</svg>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city missed-call card back">
  ${commonDefs}
  ${heroBase(0.62)}
  ${textLine("Your AI Agent", 76, 132, "headlineLight")}
  ${textLine("for plumbing calls.", 76, 190, "headlineLight")}
  ${variant.backBullets.map((bullet, index) => textLine(`${index + 1}. ${bullet}`, 86, 302 + index * 62, "bulletLight")).join("\n  ")}
  ${offerLine(84, 532)}
  ${repLine(84, 596)}
  <image href="${qrDataUrl}" x="850" y="96" width="170" height="170"/>
  ${textLine("Scan", 935, 300, "smallLight", "middle")}
</svg>`;
  }

  if (variant.id === "dustin-pipe-live-demo") {
    if (side === "front") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city live demo card front">
  ${commonDefs}
  ${heroBase(0.72)}
  ${textLine("pipe.city", 74, 116, "brandLight")}
  ${yellowRule(78, 152, 112)}
  ${textLine("Call the", 78, 290, "heroHeadline")}
  ${textLine("demo line.", 78, 366, "heroHeadline")}
  ${demoLine(78, 476)}
  ${textLine("Hear the AI Agent answer a plumbing call.", 82, 536, "subLight")}
  ${repLine(82, 612, "smallLight")}
</svg>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city live demo card back">
  ${commonDefs}
  ${heroBase(0.62)}
  ${textLine("Live pipe.city", 76, 138, "headlineLight")}
  ${textLine("AI Agent demo.", 76, 196, "headlineLight")}
  ${textLine("Answers call  |  Texts owner  |  Captures job", 82, 286, "subLight")}
  ${textLine("Demo line", 82, 380, "kickerLight")}
  ${demoLine(82, 452)}
  ${offerLine(84, 548)}
  ${repLine(84, 606)}
  <image href="${qrDataUrl}" x="870" y="92" width="150" height="150"/>
</svg>`;
  }

  if (side === "front") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city local trust card front">
  ${commonDefs}
  ${heroBase(0.7)}
  ${textLine("pipe.city", 74, 116, "brandLight")}
  ${yellowRule(78, 152, 112)}
  ${textLine("AI Agent", 78, 300, "heroHeadline")}
  ${textLine("for plumbing calls.", 78, 376, "heroHeadline")}
  ${textLine("Demo line", 82, 462, "kickerLight")}
  ${demoLine(82, 535)}
  ${repLine(82, 612, "smallLight")}
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city local trust card back">
  ${commonDefs}
  ${heroBase(0.62)}
  ${textLine(rep.name, 76, 140, "headlineLight")}
  ${textLine(rep.role, 80, 196, "subLight")}
  ${textLine(rep.phone, 80, 286, "demoNumber")}
  ${textLine(rep.email, 84, 342, "smallLight")}
  ${textLine("Local setup help for Arizona plumbing owners.", 84, 430, "subLight")}
  ${textLine("Demo line", 84, 514, "kickerLight")}
  ${textLine(PIPE_CITY_DEMO_LINE, 84, 586, "headlineLight")}
  <image href="${qrDataUrl}" x="892" y="92" width="132" height="132"/>
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
