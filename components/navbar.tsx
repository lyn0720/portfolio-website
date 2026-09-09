"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import ColorThemeToggle from "@/components/color-theme-toggle"
import { Menu, X, Leaf } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMobile()

  const navItems = [
    { name: "首页", href: "#" },
    { name: "文章", href: "#articles" },
    { name: "专栏", href: "#columns" },
    { name: "分类", href: "#categories" },
    { name: "归档", href: "#archive" },
    { name: "留言", href: "#comments" },
    { name: "写文章", href: "/write" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 从其他页面（如 /write）带锚点跳回首页时，自动滚动到对应区块
  useEffect(() => {
    if (window.location.pathname !== "/" || !window.location.hash) return
    const hash = window.location.hash
    const timer = window.setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [])

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false)
    if (href === "#") {
      // 首页项：在首页则回到顶部，否则跳回首页
      if (window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        window.location.href = "/"
      }
      return
    }
    if (href.startsWith("#")) {
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: "smooth" })
      } else {
        // 当前页面没有该区块（如在 /write 页），跳回首页对应区块
        window.location.href = `/${href}`
      }
    } else {
      window.location.href = href
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 dark:bg-jungle-900/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2">
              <img src="/images/avatar.jpg" alt="择则责的博客" className="h-10 w-10 rounded-md object-cover" />
              <div
                className={`font-bold text-xl flex items-center ${
                  isScrolled ? "text-stone-800 dark:text-white" : "text-white"
                }`}
              >
                择
                <span className={isScrolled ? "text-honey-700 dark:text-honey-300" : "text-honey-300"}>
                  则责
                </span>
                <Leaf
                  className={`h-4 w-4 ml-1 ${
                    isScrolled ? "text-jungle-500 dark:text-jungle-300" : "text-jungle-300"
                  }`}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => scrollToSection(item.href)}
                  className={
                    isScrolled
                      ? "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
                      : "text-white/90 hover:!text-white hover:!bg-white/10"
                  }
                >
                  {item.name}
                </Button>
              ))}
              <span className={isScrolled ? "" : "text-white"}>
                <ColorThemeToggle />
              </span>
              <span className={isScrolled ? "" : "text-white"}>
                <ThemeToggle />
              </span>
            </nav>

            {/* Mobile Navigation Toggle */}
            <div className="flex items-center md:hidden gap-2">
              <span className={isScrolled ? "" : "text-white"}>
                <ColorThemeToggle />
              </span>
              <span className={isScrolled ? "" : "text-white"}>
                <ThemeToggle />
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="切换菜单"
                className={`transition-transform duration-150 active:scale-90 ${isScrolled ? "" : "hover:!bg-white/10"}`}
              >
                <motion.span
                  key={isMenuOpen ? "close" : "menu"}
                  initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="inline-flex"
                >
                  {isMenuOpen ? (
                    <X className={`h-6 w-6 ${isScrolled ? "text-stone-800 dark:text-white" : "text-white"}`} />
                  ) : (
                    <Menu className={`h-6 w-6 ${isScrolled ? "text-stone-800 dark:text-white" : "text-white"}`} />
                  )}
                </motion.span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-jungle-900/95 pt-16">
          <nav className="container mx-auto px-4 py-8 flex flex-col gap-4">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                onClick={() => scrollToSection(item.href)}
                className="w-full justify-start text-lg py-4 text-stone-800 dark:text-white"
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
