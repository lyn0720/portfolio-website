import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  metadataBase: new URL("https://yanni0724.xyz"),
  title: "择则责的个人博客 | 记录生活与成长",
  description: "写自己想写的，记录能够记录的——一个分享生活点滴与个人感悟的博客",
  keywords: ["择则责", "个人博客", "生活记录", "随笔", "yanni0724"],
  openGraph: {
    title: "择则责的个人博客 | 记录生活与成长",
    description: "写自己想写的，记录能够记录的——一个分享生活点滴与个人感悟的博客",
    url: "https://yanni0724.xyz",
    siteName: "择则责的个人博客",
    locale: "zh_CN",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("zezhe-color-theme");var r=document.documentElement;r.classList.remove("theme-violet","theme-green");r.classList.add(t==="violet"?"theme-violet":"theme-green")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
