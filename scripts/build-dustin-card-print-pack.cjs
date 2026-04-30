/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs/promises");
const path = require("node:path");
const QRCode = require("qrcode");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const hiresDir = path.join(root, "public", "sales-assets", "print-hires");
const printDir = path.join(root, "public", "sales-assets", "print");

const commonParams = {
  rep: "DUSTINAZ",
  trade_domain: "pipe.city",
};

const qrCards = [
  {
    id: "dustin-pipe-local-trust",
    cardId: "dustin-pipe-local-trust-master",
    file: "dustin-pipe-local-trust-back-print-2172x1272.png",
    overlay: { left: 1658, top: 690, size: 284 },
  },
  {
    id: "dustin-pipe-live-demo",
    cardId: "dustin-pipe-live-demo-master",
    file: "dustin-pipe-live-demo-back-print-2172x1272.png",
    overlay: { left: 1748, top: 830, size: 268 },
  },
];

const printFiles = [
  "dustin-pipe-local-trust-front-print",
  "dustin-pipe-local-trust-back-print",
  "dustin-pipe-missed-call-front-print",
  "dustin-pipe-missed-call-back-print",
  "dustin-pipe-live-demo-front-print",
  "dustin-pipe-live-demo-back-print",
];

function trackingUrl(card) {
  const url = new URL("https://pumpcans.com/api/sales/track");
  for (const [key, value] of Object.entries(commonParams)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("card", card.id);
  url.searchParams.set("card_id", card.cardId);
  return url.toString();
}

async function qrOverlay(card) {
  const qrBuffer = await QRCode.toBuffer(trackingUrl(card), {
    errorCorrectionLevel: "H",
    margin: 2,
    width: card.overlay.size,
    color: {
      dark: "#05070a",
      light: "#ffffff",
    },
  });

  const source = path.join(hiresDir, card.file);
  const tmp = `${source}.tmp`;

  await sharp(source)
    .composite([{ input: qrBuffer, left: card.overlay.left, top: card.overlay.top }])
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  await fs.rename(tmp, source);
}

async function rebuildLowResPrints() {
  await fs.mkdir(printDir, { recursive: true });

  for (const stem of printFiles) {
    const source = path.join(hiresDir, `${stem}-2172x1272.png`);
    const output = path.join(printDir, `${stem}-1086x636.png`);
    await sharp(source).resize(1086, 636).png({ compressionLevel: 9 }).toFile(output);
  }
}

async function main() {
  for (const card of qrCards) {
    await qrOverlay(card);
  }
  await rebuildLowResPrints();
  console.log("Dustin card QR overlays and print PNGs rebuilt from imagegen proof assets.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
