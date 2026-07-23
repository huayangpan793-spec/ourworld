import type { Metadata } from "next";
import "@/styles/globals.css";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  title: "花与灵的记忆星球",
  description: "我们在世界上留下的光 — 记录我们共同走过的每一段路。",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=LXGW+WenKai&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Noto+Serif+SC:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
