import { NextResponse } from 'next/server'

interface GenerateRequest {
  prompt: string
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
  const { prompt, platform = 'linkedin', format = 'single-image', count = 2 } = body

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(generateFallback(prompt, platform, count), { status: 200 })
  }

  const systemContext = `You are an expert performance marketing copywriter for Saw.City — a field service management platform built for 1-10 person trade operator teams. No-demo, self-serve, $149/mo. You write direct-response ad copy that drives signups, not brand awareness.

Platform: ${platform}
Format: ${format}

Return ONLY a JSON array of ${count} ad variations. Each object must have: headline (max 60 chars), primaryText (max 280 chars), cta (one of: "Try Free", "Get Started", "Learn More", "See How It Works", "Start Today").

No markdown, no explanation, just the JSON array.`

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemContext}\n\nUser prompt: ${prompt}` }] }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', errText)
      return NextResponse.json(generateFallback(prompt, platform, count), { status: 200 })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON array from response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('No JSON array in Gemini response:', rawText)
      return NextResponse.json(generateFallback(prompt, platform, count), { status: 200 })
    }

    const variations: AdVariation[] = JSON.parse(jsonMatch[0])
    return NextResponse.json({ variations, source: 'gemini' })

  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json(generateFallback(prompt, platform, count), { status: 200 })
  }
}

function generateFallback(prompt: string, platform: string, count: number) {
  const headlines = [
    'Stop Losing Jobs to Disorganization',
    'Run Your Crew From Your Phone',
    'Dispatch, Invoice, Done — $149/mo',
    'No Demo. No Sales Call. Just Sign Up.',
    'Built for Concrete Cutters. Finally.',
    'From Estimate to Invoice in One Tool',
  ]

  const texts = [
    `Saw.City is built for 1-10 person trade teams. Dispatch jobs, track your crew, and invoice customers — all from your phone. Set up in 10 minutes.`,
    `Stop managing your business with texts and spreadsheets. Saw.City puts scheduling, field tickets, and invoicing in one place. No demo call required.`,
    `Every concrete cutter has the same problem: too much paperwork, not enough time. Saw.City fixes that. $149/mo, cancel anytime.`,
  ]

  const ctas = ['Try Free', 'Get Started', 'See How It Works']

  const variations = Array.from({ length: Math.min(count, 3) }, (_, i) => ({
    headline: headlines[i % headlines.length],
    primaryText: texts[i % texts.length],
    cta: ctas[i % ctas.length],
  }))

  return { variations, source: 'fallback', note: 'AI generation unavailable, using curated fallback copy' }
}
