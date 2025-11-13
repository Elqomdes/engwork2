import Link from "next/link";

export default function Home() {
  const practiceAreas = [
    {
      title: "Reading",
      description: "Practice reading comprehension with IELTS-style passages",
      icon: "📖",
      href: "/reading",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Writing",
      description: "Improve your writing skills with AI-powered feedback",
      icon: "✍️",
      href: "/writing",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Listening",
      description: "Enhance your listening comprehension",
      icon: "🎧",
      href: "/listening",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Speaking",
      description: "Practice speaking with AI evaluation",
      icon: "🎤",
      href: "/speaking",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          English Exam Preparation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master IELTS and other English exams with AI-powered practice in reading, writing, listening, and speaking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {practiceAreas.map((area) => (
          <Link
            key={area.title}
            href={area.href}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="p-8 relative z-10">
              <div className="text-6xl mb-4">{area.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {area.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {area.description}
              </p>
              <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                Start Practice
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            Our AI-powered platform helps you prepare for English exams like IELTS by providing personalized practice in all four key areas:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Reading:</strong> Practice with authentic passages and get instant feedback</li>
            <li><strong>Writing:</strong> Submit your essays and receive detailed AI evaluation</li>
            <li><strong>Listening:</strong> Improve comprehension with audio exercises</li>
            <li><strong>Speaking:</strong> Record your speech and get AI-powered pronunciation and fluency analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

