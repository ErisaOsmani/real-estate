import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; 

export const metadata: Metadata = {
  title: "Estate Studio AI",
  description: "Generate elegant real estate listings with AI assistance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>  
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
