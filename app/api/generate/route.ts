import { NextResponse } from 'next/server'

const TRADE_MAP: Record<string, { brand: string; domain: string; trade: string; persona: string }> = {
  saw:    { brand: 'Saw.City',    domain: 'saw.city',    trade: 'concrete cutting',   persona: 'concrete cutter / saw operator' },
  rinse:  { brand: 'Rinse.City', domain: 'rinse.city',  trade: 'pressure washing',   persona: 'pressure washer / rinse operator' },
  mow:    { brand: 'Mow.City',   domain: 'mow.city',    trade: 'lawn care',          persona: 'lawn care operator / landscaper' },
  rooter: { brand: 'Rooter.City',domain: 'rooter.city', trade: 'drain cleaning',     persona: 'drain cleaning / rooter operator' },
  pipe:   { brand: 'Pipe.City',  domain: 'pipe.city',   trade: 'plumbing',           persona: 'plumber' },
  pave:   { brand: 'Pave.City',  domain: 'pave.city',   trade: 'paving',             persona: 'paving contractor' },
  haul:   { brand: 'Haul.City',  domain: 'haul.city',   trade: 'hauling',            persona: 'hauler / dump truck operator' },
  coat:   { brand: 'Coat.City',  domain: 'coat.city',   trade: 'painting / coating', persona: 'painter / coating contractor' },
  grade:  { brand: 'Grade.City', domain: 'grade.city',  trade: 'grading',            persona: 'grading / excavation operator' },
  wrench: { brand: 'Wrench.City',domain: 'wrench.city', trade: 'auto repair',        persona: 'auto mechanic / shop owner' },
}

const STYLE_MAP: Record<string, string> = {
  'pain-point':    'Lead with the pain. First sentence names the problem. Copy builds tension before relief.',
  'feature-demo':  'Lead with a specific feature or capability. Concrete, functional, show-not-tell.',
  'social-proof':  'Build credibility first. Use operator mindset ("people like you") without fake testimonials.',
  'retargeting':   'Assume the reader has seen the product before. Urgency + completion framing. "You were close."',
}

interface GenerateRequest {
  prompt?: string
  trade?: string
  style?: string
  platform?: string
  format?: string
  count?: number
}

interface AdVariation {
  headline: string
  primaryText: string
  cta?: string
}

export async function POST(request: Request) {
  const body: GenerateRequest = await request.json()
  const {
    prompt = '',
    trade = 'saw',
    style = 'pain-point',
    platform = 'linkedin',
    format = 'static1x1',
    count = 2,
  } = body

  const tradeInfo = TRADE_MAP[trade] ?? TRADE_MAP.saw
  const styleGuide = STYLE_MAP[style] ?? STYLE_MAP['pain-point']

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(generateFallback(tradeInfo, count), { status: 200 })
  }

  const platformGuide: Record<string, string> = {
    linkedin:  'LinkedIn B2B feed. 6-line max visible. Hook must earn the "...more" click. No emojis. Professional but direct.',
    youtube:   'YouTube pre-roll / in-feed. First 5 seconds must hook or they skip. Punchy, visual language.',
    facebook:  'Facebook/Instagram feed. Scroll-stopping hook. 3 sentences max visible. Pattern interrupt.',
    instagram: 'Instagram Reels / Stories caption. Ultra-short. Punchy. CTA is a single clear command.',
  }

  const systemContext = `You are an expert performance marketing copywriter for ${tradeInfo.brand} — an AI phone agent + ops system built for 1-10 person ${tradeInfo.trade} teams. Self-serve, no-demo, $79/mo flat. The reader is a ${tradeInfo.persona} running their own business.

STYLE GUIDE: ${styleGuide}
PLATFORM: ${platformGuide[platform] ?? platformGuide.linkedin}
FORMAT: ${format}

HARD RULES:
- Always say "${tradeInfo.brand}" (never "Saw.City" or a different brand unless that IS the trade)
- Price is $79/mo — never any other number
- No corporate speak, no buzzwords, no "game-changing" or "revolutionary"
- Write like a peer, not a software company
- CTAs must be one of: "Start now", "Go live today", "Hear it live", "Finish setup now"

Return ONLY a JSON array of ${count} ad variations. Each object must have: headline (max 60 chars), primaryText (max 280 chars), cta.

No markdown, no explanation, just the JSON array.`

  const userPrompt = prompt
    ? `Additional context: ${prompt}`
    : `Write ${count} high-converting ${platform} ads for ${tradeInfo.brand} targeting ${tradeInfo.trade} operators. Style: ${style}.`

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemContext}\n\n${userPrompt}` }] }
          ],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 1500,
          }
        })
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', errText)
      return NextResponse.json(generateFallback(tradeInfo, count), { status: 200 })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('No JSON array in Gemini response:', rawText)
      return NextResponse.json(generateFallback(tradeInfo, count), { status: 200 })
    }

    const variations: AdVariation[] = JSON.parse(jsonMatch[0])
    return NextResponse.json({ variations, source: 'gemini', trade: tradeInfo, style })

  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json(generateFallback(tradeInfo, count), { status: 200 })
  }
}

function generateFallback(
  tradeInfo: { brand: string; trade: string },
  count: number,
) {
  const variations = [
    {
      headline: `Stop losing ${tradeInfo.trade} jobs to missed calls`,
      primaryText: `Every missed call is a missed job. ${tradeInfo.brand} answers for you 24/7, captures the lead, and keeps your pipeline moving. $79/mo, self-serve. No demo call required.`,
      cta: 'Start now',
    },
    {
      headline: 'Built for operators, not software tourists',
      primaryText: `${tradeInfo.brand} is built for 1-10 person trade teams who are too busy to babysit software. Set it up once. Let it run. $79/mo flat.`,
      cta: 'Go live today',
    },
    {
      headline: 'The first response usually wins the job',
      primaryText: `In ${tradeInfo.trade}, speed-to-response is everything. ${tradeInfo.brand} helps you respond faster and close more from the demand you already have.`,
      cta: 'Hear it live',
    },
  ].slice(0, count)

  return { variations, source: 'fallback', trade: tradeInfo }
}
