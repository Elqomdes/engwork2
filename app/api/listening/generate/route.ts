import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const prompt = `Based on the following listening transcript, generate 5 comprehension questions in IELTS style. The questions should test understanding of main ideas, specific details, and inference. Return only the questions, one per line, without numbering:

${transcript}

Questions:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an IELTS listening test expert. Generate clear, well-structured comprehension questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const questionsText = completion.choices[0]?.message?.content || "";
    const questions = questionsText
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && !q.match(/^\d+[\.\)]/))
      .slice(0, 5);

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions", details: error.message },
      { status: 500 }
    );
  }
}

