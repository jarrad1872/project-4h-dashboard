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
        .micro { font: 800 15px Geist, Arial, Helvetica, sans-serif; fill: #B9C1CA; letter-spacing: 1.1px; }
        .headlineDark { font: 900 48px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .headlineLight { font: 900 58px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .heroHeadline { font: 900 78px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .heroYellow { font: 900 78px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 0; }
        .repName { font: 900 54px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
        .demoNumber { font: 900 68px Geist, Arial, Helvetica, sans-serif; fill: #F5C518; letter-spacing: 0; }
        .demoHuge { font: 900 82px Geist, Arial, Helvetica, sans-serif; fill: #F2F4F6; letter-spacing: 0; }
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
    <rect x="0" y="0" width="${width}" height="${height}" fill="#0B0D0F" opacity="0.34"/>`;

  const yellowRule = (x: number, y: number, ruleWidth = 132) => `
    <line x1="${x}" y1="${y}" x2="${x + ruleWidth}" y2="${y}" stroke="#F5C518" stroke-width="8" stroke-linecap="round"/>`;

  const repLine = (x: number, y: number, className = "smallLight") =>
    textLine(`${rep.name}  |  ${rep.phone}  |  ${rep.email}`, x, y, className);

  const offerLine = (x: number, y: number, className = "offer") =>
    textLine(`${SALES_CARD_PRICE}  |  ${SALES_CARD_TRIAL}`, x, y, className);

  const demoLine = (x: number, y: number, className = "demoNumber") => textLine(PIPE_CITY_DEMO_LINE, x, y, className);

  const contactStack = (x: number, y: number) => `
    ${textLine(`Phone  ${rep.phone}`, x, y, "smallLight")}
    ${textLine(`Email  ${rep.email}`, x, y + 38, "smallLight")}
    ${textLine(`Demo   ${PIPE_CITY_DEMO_LINE}`, x, y + 76, "smallLight")}`;

  const yellowIcon = (x: number, y: number, label: string) => `
    <circle cx="${x}" cy="${y}" r="23" fill="none" stroke="#F5C518" stroke-width="5"/>
    ${textLine(label, x, y + 8, "smallLight", "middle")}`;

  const bulletRows = (x: number, y: number) => `
    ${yellowIcon(x, y, "1")}
    ${textLine("AI Agent answers", x + 48, y - 4, "bulletLight")}
    ${textLine("your calls 24/7", x + 48, y + 26, "fineLight")}
    ${yellowIcon(x, y + 88, "2")}
    ${textLine("Qualifies and books", x + 48, y + 84, "bulletLight")}
    ${textLine("more jobs", x + 48, y + 114, "fineLight")}
    ${yellowIcon(x, y + 176, "3")}
    ${textLine("Text summaries", x + 48, y + 172, "bulletLight")}
    ${textLine("while you work", x + 48, y + 202, "fineLight")}
    ${yellowIcon(x, y + 264, "$")}
    ${textLine(SALES_CARD_PRICE, x + 48, y + 260, "price")}
    ${textLine("14-day free trial", x + 48, y + 294, "fineLight")}
    ${textLine("No credit card required", x + 48, y + 322, "fineLight")}`;

  if (variant.id === "dustin-pipe-missed-call") {
    if (side === "front") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city missed-call card front">
  ${commonDefs}
  ${heroBase(0.78)}
  ${textLine("MISSED CALL", 74, 148, "heroHeadline")}
  ${textLine("= MISSED JOB", 74, 232, "heroYellow")}
  ${textLine("AI Agent answers", 78, 300, "subLight")}
  ${textLine("while you're on the job", 78, 336, "subLight")}
  ${textLine("pipe.city", 78, 508, "brandLight")}
  ${textLine("AI AGENT FOR PLUMBING CALLS", 82, 544, "micro")}
  ${demoLine(78, 628, "headlineLight")}
</svg>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city missed-call card back">
  ${commonDefs}
  ${heroBase(0.64)}
  ${bulletRows(84, 112)}
  ${textLine(rep.name.toUpperCase(), 610, 330, "repName")}
  ${textLine("ARIZONA GROWTH REP", 614, 374, "kickerLight")}
  ${contactStack(616, 440)}
  ${textLine("pipe.city", 970, 610, "smallLight", "middle")}
</svg>`;
  }

  if (variant.id === "dustin-pipe-live-demo") {
    if (side === "front") {
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city live demo card front">
  ${commonDefs}
  ${heroBase(0.74)}
  ${textLine("CALL THE", 74, 148, "heroHeadline")}
  ${textLine("DEMO LINE", 74, 232, "heroYellow")}
  ${yellowIcon(104, 326, "D")}
  ${demoLine(154, 348, "demoHuge")}
  ${textLine("pipe.city", 78, 534, "brandLight")}
  ${textLine("AI AGENT FOR PLUMBING CALLS", 82, 570, "micro")}
</svg>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city live demo card back">
  ${commonDefs}
  ${heroBase(0.64)}
  ${bulletRows(84, 112)}
  ${textLine(rep.name.toUpperCase(), 664, 188, "headlineLight")}
  ${textLine("ARIZONA GROWTH REP", 668, 224, "kickerLight")}
  ${contactStack(670, 292)}
  <rect x="870" y="430" width="178" height="178" rx="10" fill="#ffffff"/>
  <image href="${qrDataUrl}" x="884" y="444" width="150" height="150"/>
  ${textLine("pipe.city", 959, 626, "smallLight", "middle")}
</svg>`;
  }

  if (side === "front") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city local trust card front">
  ${commonDefs}
  ${heroBase(0.74)}
  ${textLine("pipe.city", 74, 116, "brandLight")}
  ${yellowRule(315, 82, 142)}
  ${textLine("AI AGENT FOR PLUMBING CALLS", 82, 152, "micro")}
  ${textLine(rep.name.toUpperCase(), 78, 392, "repName")}
  ${textLine("ARIZONA GROWTH REP", 82, 430, "kickerLight")}
  ${contactStack(84, 504)}
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Dustin Bouwhuis pipe.city local trust card back">
  ${commonDefs}
  ${heroBase(0.64)}
  ${bulletRows(84, 112)}
  <rect x="840" y="396" width="178" height="178" rx="10" fill="#ffffff"/>
  <image href="${qrDataUrl}" x="854" y="410" width="150" height="150"/>
  ${textLine("Learn more", 929, 596, "fineLight", "middle")}
  ${textLine("pipe.city", 929, 624, "smallLight", "middle")}
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
