export const creativeSourceOfTruthRules = {
  title: "Generated creative is the source of truth",
  summary:
    "For finished creative, 4H uses the image-gen artifact as the asset. The app stores, displays, tracks, approves, crops, and downloads it; it does not rebuild the visual with a separate coded layout.",
  rules: [
    "Use ChatGPT Pro image generation for the complete creative whenever the asset is visual: ad images, proof sheets, business-card boards, creator frames, and campaign mockups.",
    "Do not split finished creative into an AI background plus deterministic app typography unless Jarrad explicitly asks for a production-template export.",
    "If exact text, QR codes, or print separations are required, generate/revise until the whole image is acceptable, then store that raster as the approved artifact.",
    "Code-rendered SVG/HTML mockups are allowed only as wireframes, metadata previews, crop helpers, or legacy print-export utilities, and must be labeled as such.",
    "Approval decisions should point at the generated asset URL or uploaded file, not at a reconstructed approximation.",
  ],
  blockedPattern: "Half image-gen, half coded recreation for a finished asset.",
  allowedAppWork:
    "Asset cataloging, prompt packets, upload, review status, approval gates, source links, UTMs, dimensions, lineage, crops, downloads, and performance tracking.",
};
