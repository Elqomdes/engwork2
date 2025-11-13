"use client";

import { useState } from "react";

export default function WritingPage() {
  const [topic, setTopic] = useState("");
  const [essay, setEssay] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sampleTopics = [
    "Some people think that technology has made our lives more complicated. Others believe it has made life easier. Discuss both views and give your opinion.",
    "Many people believe that social media has a negative impact on society. To what extent do you agree or disagree?",
    "Some people prefer to live in a small town, while others prefer to live in a big city. Discuss both views and give your opinion.",
  ];

  const handleEvaluate = async () => {
    if (!essay.trim() || !topic.trim()) {
      alert("Please provide both a topic and your essay");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          essay,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate essay");
      }
      setResults(data);
    } catch (error: any) {
      console.error("Error evaluating essay:", error);
      alert(error.message || "Failed to evaluate essay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Writing Practice</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Writing Topic</h2>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your writing topic or question here..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-4"
        />
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Sample Topics:</p>
          <div className="space-y-2">
            {sampleTopics.map((sampleTopic, index) => (
              <button
                key={index}
                onClick={() => setTopic(sampleTopic)}
                className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition"
              >
                {sampleTopic}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Your Essay</h2>
          <div className="text-sm text-gray-500">
            {essay.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Write your essay here..."
          className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
        />
        <button
          onClick={handleEvaluate}
          disabled={loading || !essay.trim() || !topic.trim()}
          className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? "Evaluating..." : "Get AI Evaluation"}
        </button>
      </div>

      {results && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Evaluation Results</h2>

          {results.score !== undefined && (
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
              <p className="text-4xl font-bold">{results.score}/9</p>
              <p className="text-sm mt-2 opacity-90">IELTS Band Score</p>
            </div>
          )}

          {results.criteria && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.criteria).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, " ")}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">{value}/9</p>
                </div>
              ))}
            </div>
          )}

          {results.feedback && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Detailed Feedback</h3>
              <p className="text-blue-700 whitespace-pre-wrap">{results.feedback}</p>
            </div>
          )}

          {results.suggestions && results.suggestions.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Suggestions for Improvement</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                {results.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

