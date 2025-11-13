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

    const { passage, questions, answers } = await request.json();

    if (!passage || !questions || !answers) {
      return NextResponse.json(
        { error: "Passage, questions, and answers are required" },
        { status: 400 }
      );
    }

    const answersText = questions
      .map((q: string, index: number) => `Q${index + 1}: ${q}\nAnswer: ${answers[index] || "No answer"}`)
      .join("\n\n");

    const prompt = `Evaluate the following reading comprehension answers based on the passage. Provide:
1. A score out of 100 (percentage)
2. Detailed feedback on each answer
3. Overall assessment

Passage:
${passage}

Questions and Answers:
${answersText}

Provide your evaluation in a structured format.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an IELTS reading test evaluator. Provide fair, constructive feedback and accurate scoring.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const feedback = completion.choices[0]?.message?.content || "";
    
    // Extract score if mentioned
    const scoreMatch = feedback.match(/(\d+)%/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    return NextResponse.json({
      feedback,
      score: score || undefined,
    });
  } catch (error: any) {
    console.error("Error evaluating answers:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answers", details: error.message },
      { status: 500 }
    );
  }
}

