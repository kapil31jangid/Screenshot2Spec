import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Screenshot2Spec — AI-Powered Frontend Blueprint & Implementation Prompt Generator',
  description: 'Deconstruct any UI screenshot into production component hierarchies, Tailwind styles, TypeScript interfaces, and 15-section AI coding prompts using Gemma 4 multimodal vision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
