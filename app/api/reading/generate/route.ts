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

    const { passage } = await request.json();

    if (!passage) {
      return NextResponse.json(
        { error: "Passage is required" },
        { status: 400 }
      );
    }

    const prompt = `Based on the following reading passage, generate 5 comprehension questions in IELTS style. The questions should test understanding of main ideas, details, inference, and vocabulary. Return only the questions, one per line, without numbering:

${passage}

Questions:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an IELTS reading test expert. Generate clear, well-structured comprehension questions.",
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

