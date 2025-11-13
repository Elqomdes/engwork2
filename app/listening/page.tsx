"use client";

import { useState } from "react";

export default function ListeningPage() {
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!transcript.trim()) {
      alert("Please enter a transcript first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/listening/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
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
      const response = await fetch("/api/listening/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
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
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Listening Practice</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Audio Source (Optional)</h2>
        <input
          type="url"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="Enter audio URL (YouTube, MP3, etc.)"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
        />
        {audioUrl && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Audio URL provided. Please listen and then work with the transcript below.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Transcript</h2>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Enter or paste the transcript of the audio here. You can also paste a sample transcript to practice..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 mt-2">
          Tip: For practice, you can paste any English transcript. In a real scenario, you would listen to audio first.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Comprehension Questions</h2>
          <button
            onClick={handleGenerateQuestions}
            disabled={loading || !transcript.trim()}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-semibold text-gray-700 mb-2">
                  Question {index + 1}: {question}
                </p>
                <input
                  type="text"
                  value={answers[index] || ""}
                  onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                  placeholder="Your answer..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Overall Feedback</h3>
                <p className="text-purple-700 whitespace-pre-wrap">{results.feedback}</p>
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

