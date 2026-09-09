"use client"

import { Camera, Mail, Rss, Clapperboard, BookOpen, Leaf } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const columns = [
    { name: "我的文章", href: "#articles" },
    { name: "博客专栏", href: "#columns" },
    { name: "分类与标签", href: "#categories" },
    { name: "文章归档", href: "#archive" },
    { name: "留言板", href: "#comments" },
  ]

  const scrollToSection = (href: string) => {
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="py-8 bg-jungle-900 text-stone-300 relative overflow-hidden">
      {/* Jungle silhouette at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
        <div
          className="w-full h-full bg-bottom bg-repeat-x"
          style={{
            backgroundImage: `url('/images/django-jungle.png')`,
            backgroundSize: "auto 100%",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/avatar.jpg" alt="择则责的博客" className="h-10 w-10 rounded-md object-cover" />
            <div>
              <p className="text-lg font-semibold text-white flex items-center">
                择则责的博客 <Leaf className="h-4 w-4 ml-1 text-jungle-400" />
              </p>
              <p className="text-sm text-jungle-300">记录生活，分享成长</p>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-2 text-sm">
            {columns.map((column) => (
              <button
                key={column.href}
                onClick={() => scrollToSection(column.href)}
                className="px-2 py-1 hover:text-honey-300 transition-colors"
              >
                {column.name}
              </button>
            ))}
          </nav>

          <div className="flex gap-3">
            <a
              href="#"
              className="p-2 rounded-full hover:bg-jungle-800 transition-colors"
              aria-label="小红书"
            >
              <Camera className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-full hover:bg-jungle-800 transition-colors"
              aria-label="豆瓣"
            >
              <BookOpen className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-full hover:bg-jungle-800 transition-colors"
              aria-label="哔哩哔哩"
            >
              <Clapperboard className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-full hover:bg-jungle-800 transition-colors"
              aria-label="RSS"
            >
              <Rss className="h-5 w-5" />
            </a>
            <a
              href="mailto:hi@zezhe.blog"
              className="p-2 rounded-full hover:bg-jungle-800 transition-colors"
              aria-label="邮箱"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="text-center text-sm text-jungle-300 mt-6 pt-6 border-t border-jungle-800/60">
          © {currentYear} 择则责的博客 版权所有 · 用文字记录成长的轨迹
        </div>
      </div>
    </footer>
  )
}
