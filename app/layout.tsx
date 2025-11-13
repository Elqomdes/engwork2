import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English Exam Prep - IELTS Practice",
  description: "Practice reading, writing, listening, and speaking for IELTS and other English exams with AI-powered evaluation",
  keywords: ["IELTS", "English exam", "English practice", "IELTS preparation", "English learning"],
  authors: [{ name: "English Exam Prep" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "English Exam Prep - IELTS Practice",
    description: "AI-powered IELTS practice platform for reading, writing, listening, and speaking",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </main>
      </body>
    </html>
  );
}

