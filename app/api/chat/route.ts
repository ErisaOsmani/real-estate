import { NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk"
import type { ListingTone } from "@/lib/api"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const allowedTones: ListingTone[] = ["Professional", "Luxury", "Short", "Family"]

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is missing from configuration." },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => null)
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const tone = allowedTones.includes(body?.tone) ? body.tone : "Professional"
    const mode =
      body?.mode === "admin-marketing" || body?.mode === "client-advisor"
        ? body.mode
        : "description"

    if (!message) {
      return NextResponse.json(
        { error: "Enter property details before generating content." },
        { status: 400 }
      )
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "The text is too long. The maximum is 5000 characters." },
        { status: 400 }
      )
    }

    if (mode === "admin-marketing") {
      const chatCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional real estate marketing assistant for the Kosovo market. Write in clear English, do not invent facts, and return only valid JSON with no markdown or extra text.",
          },
          {
            role: "user",
            content: `Create a marketing package from these property details.

Details:
${message}

Return exactly this JSON structure:
{
  "title": "professional title up to 90 characters",
  "description": "professional description with 2 short paragraphs",
  "socialPost": "Instagram/Facebook copy with a persuasive tone and 3-5 hashtags",
  "portalShort": "very short portal version, 1 paragraph",
  "missingFields": ["price", "location", "area", "bedrooms", "photo"]
}

In missingFields include only fields that are actually missing from the details.`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.55,
      })

      const reply = chatCompletion.choices[0]?.message?.content?.trim()

      if (!reply) {
        return NextResponse.json(
          { error: "AI did not return a marketing package. Please try again." },
          { status: 502 }
        )
      }

      const packageData = JSON.parse(reply)

      return NextResponse.json({
        title: String(packageData.title ?? ""),
        description: String(packageData.description ?? ""),
        socialPost: String(packageData.socialPost ?? ""),
        portalShort: String(packageData.portalShort ?? ""),
        missingFields: Array.isArray(packageData.missingFields)
          ? packageData.missingFields.map(String)
          : [],
      })
    }

    if (mode === "client-advisor") {
      const chatCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a simple, careful advisor for clients looking for property in Kosovo. Use only the provided properties; do not invent properties, prices, or locations. Reply in simple English and return only valid JSON with no markdown or extra text.",
          },
          {
            role: "user",
            content: `Client request and profile:
${message}

Return exactly this JSON structure:
{
  "summary": "short and simple answer for the client",
  "recommendedIds": ["property-id-1", "property-id-2", "property-id-3"],
  "comparison": "comparison of the 2-3 most suitable properties",
  "prosCons": [
    { "propertyId": "property-id", "pros": ["advantage"], "cons": ["drawback"] }
  ],
  "nextStep": "what the client should do next"
}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.45,
      })

      const reply = chatCompletion.choices[0]?.message?.content?.trim()

      if (!reply) {
        return NextResponse.json(
          { error: "AI did not return recommendations. Please try again." },
          { status: 502 }
        )
      }

      const advisorData = JSON.parse(reply)

      return NextResponse.json({
        summary: String(advisorData.summary ?? ""),
        recommendedIds: Array.isArray(advisorData.recommendedIds)
          ? advisorData.recommendedIds.map(String).slice(0, 3)
          : [],
        comparison: String(advisorData.comparison ?? ""),
        prosCons: Array.isArray(advisorData.prosCons) ? advisorData.prosCons : [],
        nextStep: String(advisorData.nextStep ?? ""),
      })
    }

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional real estate marketing assistant for the Kosovo market. Always write in clear English. The answer must be ready for a property listing, clear, persuasive, and must not invent facts that were not provided.",
        },
        {
          role: "user",
          content: `Desired tone: ${tone}.

Property details:
${message}

Create a professional description with 2-3 short paragraphs. At the end, add one short line with 3 key property highlights.`,
        },
      ],
      temperature: 0.65,
    })

    const reply = chatCompletion.choices[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json(
        { error: "AI did not return a description. Please try again." },
        { status: 502 }
      )
    }

    return NextResponse.json({ reply })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
