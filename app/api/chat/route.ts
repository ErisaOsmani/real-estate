import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: NextRequest) {

  const { message } = await req.json();

  const chatCompletion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",
        content: "You are a professional real estate marketing assistant specialized in Kosovo property market."
      },
      {
        role: "user",
        content: message
      }
    ],

    temperature: 0.7
  });

  return NextResponse.json({
    reply: chatCompletion.choices[0].message.content
  });

}