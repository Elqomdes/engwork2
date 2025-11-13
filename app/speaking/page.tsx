"use client";

import { useState, useRef, useEffect } from "react";

export default function SpeakingPage() {
  const [topic, setTopic] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const sampleTopics = [
    "Describe a memorable trip you have taken.",
    "Talk about a person who has influenced you.",
    "Describe your favorite hobby or pastime.",
    "Discuss a book or movie that made an impression on you.",
    "Talk about your future career plans.",
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      alert("Please record audio first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/speaking/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }
      if (data.transcript) {
        setTranscript(data.transcript);
      }
    } catch (error: any) {
      console.error("Error transcribing:", error);
      alert(error.message || "Failed to transcribe audio");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!transcript.trim() || !topic.trim()) {
      alert("Please provide both a topic and transcript");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/speaking/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          transcript,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate speech");
      }
      setResults(data);
    } catch (error: any) {
      console.error("Error evaluating speech:", error);
      alert(error.message || "Failed to evaluate speech");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Speaking Practice</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Speaking Topic</h2>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your speaking topic here..."
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-4"
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
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Record Your Speech</h2>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-8 py-4 rounded-lg font-semibold text-white transition ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {isRecording ? (
              <>
                <span className="inline-block w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
                Stop Recording
              </>
            ) : (
              "Start Recording"
            )}
          </button>
          {audioUrl && (
            <audio controls src={audioUrl} className="flex-1" />
          )}
        </div>
        <button
          onClick={handleTranscribe}
          disabled={loading || !audioBlob}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? "Transcribing..." : "Transcribe Audio"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Transcript</h2>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your transcribed speech will appear here, or you can type it manually..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
        <button
          onClick={handleEvaluate}
          disabled={loading || !transcript.trim() || !topic.trim()}
          className="mt-4 w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? "Evaluating..." : "Get AI Evaluation"}
        </button>
      </div>

      {results && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">Evaluation Results</h2>

          {results.score !== undefined && (
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-6 rounded-lg">
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
                  <p className="text-2xl font-bold text-orange-600">{value}/9</p>
                </div>
              ))}
            </div>
          )}

          {results.feedback && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Detailed Feedback</h3>
              <p className="text-orange-700 whitespace-pre-wrap">{results.feedback}</p>
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

