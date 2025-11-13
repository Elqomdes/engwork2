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

    const { topic, essay } = await request.json();

    if (!topic || !essay) {
      return NextResponse.json(
        { error: "Topic and essay are required" },
        { status: 400 }
      );
    }

    const prompt = `Evaluate this IELTS writing task. Provide:
1. Overall band score (1-9)
2. Scores for each criterion:
   - Task Achievement / Task Response (1-9)
   - Coherence and Cohesion (1-9)
   - Lexical Resource (1-9)
   - Grammatical Range and Accuracy (1-9)
3. Detailed feedback explaining the scores
4. Specific suggestions for improvement

Topic: ${topic}

Essay:
${essay}

Format your response as JSON with the following structure:
{
  "score": <overall score 1-9>,
  "criteria": {
    "task_achievement": <score 1-9>,
    "coherence_cohesion": <score 1-9>,
    "lexical_resource": <score 1-9>,
    "grammatical_range_accuracy": <score 1-9>
  },
  "feedback": "<detailed feedback>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an IELTS writing examiner. Evaluate essays according to official IELTS criteria. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      // Fallback if JSON parsing fails
      result = {
        score: 6,
        criteria: {
          task_achievement: 6,
          coherence_cohesion: 6,
          lexical_resource: 6,
          grammatical_range_accuracy: 6,
        },
        feedback: responseText,
        suggestions: [],
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error evaluating essay:", error);
    return NextResponse.json(
      { error: "Failed to evaluate essay", details: error.message },
      { status: 500 }
    );
  }
}

