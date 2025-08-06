import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import { GoogleAnalytics } from '@next/third-parties/google'
import "./globals.css";
import Head from "next/head";


export const metadata: Metadata = {
  title: "网络安全研究：JetBrains许可服务器分析平台 - Security Research",
  description: "网络安全研究项目：专注于JetBrains许可服务器的网络空间分布分析和安全态势研究。仅供学术研究和教育用途。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
    <Head>
        <script async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7071981603083503"
                crossOrigin="anonymous"></script>
    </Head>
    <body>{children}</body>
    <Analytics/>
    <GoogleAnalytics gaId="G-ZLBSTV69B2"/>
    </html>
  );
}
