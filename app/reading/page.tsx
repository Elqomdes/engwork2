"use client";

import { useState } from "react";

export default function ReadingPage() {
  const [passage, setPassage] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const samplePassage = `The Industrial Revolution was a period of major industrialization that began in Great Britain in the mid-18th century and spread to other parts of the world. This era marked a shift from agrarian societies to industrial ones, fundamentally changing how people lived and worked.

The revolution was characterized by the introduction of new manufacturing processes, the development of new technologies, and significant social and economic changes. Key innovations included the steam engine, which revolutionized transportation and manufacturing, and the mechanization of textile production.

The impact of the Industrial Revolution was profound. It led to urbanization as people moved from rural areas to cities in search of work. It also created new social classes and changed the nature of work itself. While it brought about economic growth and technological advancement, it also resulted in poor working conditions and environmental degradation.`;

  const handleGenerateQuestions = async () => {
    if (!passage.trim()) {
      alert("Please enter or load a passage first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }
      if (data.questions) {
        setQuestions(data.questions);
        setAnswers({});
        setResults(null);
      }
    } catch (error: any) {
      console.error("Error generating questions:", error);
      alert(error.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      alert("Please generate questions first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reading/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passage,
          questions,
          answers,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate answers");
      }
      setResults(data);
    } catch (error: any) {
      console.error("Error evaluating answers:", error);
      alert(error.message || "Failed to evaluate answers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Reading Practice</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Reading Passage</h2>
          <button
            onClick={() => setPassage(samplePassage)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Load Sample Passage
          </button>
        </div>
        <textarea
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
          placeholder="Enter or paste your reading passage here..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Questions</h2>
          <button
            onClick={handleGenerateQuestions}
            disabled={loading || !passage.trim()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold text-gray-700 mb-2">
                  Question {index + 1}: {question}
                </p>
                <textarea
                  value={answers[index] || ""}
                  onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                  placeholder="Your answer..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Evaluating..." : "Submit Answers"}
            </button>
          </div>
        )}

        {questions.length === 0 && (
          <p className="text-gray-500 italic">Generate questions to start practicing</p>
        )}
      </div>

      {results && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Evaluation Results</h2>
          <div className="space-y-4">
            {results.feedback && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Overall Feedback</h3>
                <p className="text-blue-700 whitespace-pre-wrap">{results.feedback}</p>
              </div>
            )}
            {results.score !== undefined && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Score</h3>
                <p className="text-3xl font-bold text-green-700">{results.score}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

