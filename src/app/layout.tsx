import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "AI Diet Planner Pro",
  description:
    "Personalized AI wellness and Indian diet planning platform with health tracking, recovery insights, and smart nutrition.",
  keywords: [
    "AI Diet Planner",
    "Indian Diet Planner",
    "Wellness Tracker",
    "Fitness App",
    "Nutrition AI",
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
    <head>
      <meta
        name="google-site-verification"
        content="YOUR_GOOGLE_CODE"
      />
    </head>
  
    <body className="min-h-full flex flex-col">
      <ToastProvider>{children}</ToastProvider>
    </body>
  </html>
  );
}
