import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "myBakingStory",
  description: "함께 굽고 기록하는 베이킹 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
