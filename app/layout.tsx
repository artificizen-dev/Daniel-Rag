import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatroomProvider } from "./providers/ChatroomContext";
import MessageProvider from "./providers/MessageProvider";
import { AuthProvider } from "./providers/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rag App",
  description: "Agentic App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ChatroomProvider>
            <MessageProvider>{children}</MessageProvider>
          </ChatroomProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
