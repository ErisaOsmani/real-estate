import { NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk"
import type { ListingTone } from "@/lib/api"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const allowedTones: ListingTone[] = ["Profesional", "Luksoz", "I shkurtër", "Familjar"]

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Mungon GROQ_API_KEY në konfigurim." },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => null)
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const tone = allowedTones.includes(body?.tone) ? body.tone : "Profesional"

    if (!message) {
      return NextResponse.json(
        { error: "Shkruaj detajet e pronës para gjenerimit." },
        { status: 400 }
      )
    }

    if (message.length > 700) {
      return NextResponse.json(
        { error: "Teksti është shumë i gjatë. Maksimumi është 700 karaktere." },
        { status: 400 }
      )
    }

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Je asistent profesional për marketing të patundshmërive në tregun e Kosovës. Shkruaj gjithmonë në shqip standard, pa gabime drejtshkrimore. Përgjigjja duhet të jetë e gatshme për listim prone, e qartë, bindëse dhe pa shpikur fakte që nuk janë dhënë.",
        },
        {
          role: "user",
          content: `Toni i dëshiruar: ${tone}.

Detajet e pronës:
${message}

Krijo një përshkrim profesional me 2-3 paragrafë të shkurtër. Në fund shto një rresht të shkurtër me 3 pika kryesore të pronës.`,
        },
      ],
      temperature: 0.65,
    })

    const reply = chatCompletion.choices[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json(
        { error: "AI nuk ktheu përshkrim. Provo përsëri." },
        { status: 502 }
      )
    }

    return NextResponse.json({ reply })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ndodhi një gabim i papritur."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
