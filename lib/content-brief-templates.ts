import { DEFAULT_CREATOR_CAMPAIGN } from "./creator-utm-builder";

export type ContentBriefTemplateId = "demo-call-video" | "founder-assist" | "screenshot-proof";

export interface ContentBriefTemplate {
  id: ContentBriefTemplateId;
  title: string;
  format: string;
  hook: string;
  shotList: string[];
  creatorTalkingPoints: string[];
  cta: string;
  offer: string;
  trackingGuidance: string;
}

export const CONTENT_BRIEF_TEMPLATES: ContentBriefTemplate[] = [
  {
    id: "demo-call-video",
    title: "Demo-call video",
    format: "60-90 second creator-recorded trade demo",
    hook: "Show a real missed-call moment, then call the trade domain and let the AI receptionist answer like a front-desk operator.",
    shotList: [
      "Open on the creator mid-job or in the truck with a phone ringing.",
      "State the trade-specific pain: missed calls turn into missed booked jobs.",
      "Call the trade .city demo line on speaker so the audience hears the AI intake.",
      "Show the captured job details, follow-up, or booking handoff screen if available.",
      "Close with the creator's plain-language verdict for owner-operators.",
    ],
    creatorTalkingPoints: [
      "This is built for trade owners who cannot answer every call while working.",
      "The product answers, qualifies, and captures the job request before the lead goes cold.",
      "Use the trade-specific domain in the video, not generic Saw.City branding.",
    ],
    cta: "Try the 14-day free trial with no credit card required.",
    offer: "$39/mo after trial.",
    trackingGuidance: `Use the creator-specific URL from /influencer with utm_medium=creator and utm_campaign=${DEFAULT_CREATOR_CAMPAIGN}.`,
  },
  {
    id: "founder-assist",
    title: "Founder assist",
    format: "Founder-assisted creator post or short video",
    hook: "Position Jarrad as the builder helping the creator's audience stop losing jobs to unanswered calls.",
    shotList: [
      "Creator frames the problem in their own trade language.",
      "Founder joins by clip, quote, or screen share to explain why the workflow was built.",
      "Show one practical trade example: after-hours caller, emergency request, estimate request, or scheduling callback.",
      "Creator reacts to whether the workflow would help an actual owner-operator.",
      "End with the creator URL and trial offer.",
    ],
    creatorTalkingPoints: [
      "Keep the tone operator-to-operator, not corporate software pitch.",
      "Use a specific job type from the creator's trade.",
      "Mention that the system is self-serve and built for small teams.",
    ],
    cta: "Use the creator link to start the 14-day free trial, no credit card required.",
    offer: "$39/mo after trial.",
    trackingGuidance: "Use the creator row's saved deal_page/referral_code after the brief is approved. Do not send the link until outreach is approved.",
  },
  {
    id: "screenshot-proof",
    title: "Screenshot-proof post",
    format: "Static carousel, community post, or short screen-record proof asset",
    hook: "Lead with visual proof that the AI receptionist captured a real job request while the owner was busy.",
    shotList: [
      "Slide 1: trade-specific missed-call headline.",
      "Slide 2: screenshot or mock capture of caller name, job type, timing, and urgency.",
      "Slide 3: owner view of the lead ready for callback or booking.",
      "Slide 4: price and trial offer.",
      "Slide 5: creator URL and simple next step.",
    ],
    creatorTalkingPoints: [
      "Keep screenshots legible and avoid private customer data.",
      "Use one trade scenario instead of generic automation language.",
      "Make the saved lead feel like money recovered, not a novelty AI demo.",
    ],
    cta: "Start a 14-day free trial, no credit card required.",
    offer: "$39/mo after trial.",
    trackingGuidance: "Use utm_content from the creator URL so each carousel or proof asset can be attributed separately later.",
  },
];

export function getContentBriefTemplate(id: ContentBriefTemplateId) {
  return CONTENT_BRIEF_TEMPLATES.find((template) => template.id === id) ?? null;
}

export function buildContentBriefPacket(template: ContentBriefTemplate, trackingUrl: string) {
  return [
    `${template.title} (${template.format})`,
    "",
    `Hook: ${template.hook}`,
    "",
    "Shot list:",
    ...template.shotList.map((shot, index) => `${index + 1}. ${shot}`),
    "",
    "Talking points:",
    ...template.creatorTalkingPoints.map((point) => `- ${point}`),
    "",
    `CTA: ${template.cta}`,
    `Offer: ${template.offer}`,
    `Tracking: ${trackingUrl || template.trackingGuidance}`,
  ].join("\n");
}
