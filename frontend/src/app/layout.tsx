import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Screenshot2Spec — See It. Specify It. Build It.',
  description: 'AI-powered developer productivity tool that converts UI screenshots into implementation-ready frontend development blueprints and coding prompts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF9F1] text-[#1C2B1B] antialiased selection:bg-[#FEF3B5] selection:text-[#14370D]">
        {children}
      </body>
    </html>
  );
}
