"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Leaf, BookOpen, MessageCircle } from "lucide-react"

/** 百合花剪影（六枚花被片），紫色主题的飘落元素（由 CSS 按色板类控制显隐） */
function LilyFlower({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          d="M12,11.2 C10.2,9.2 9.8,5.6 11.1,2.3 C13,4.6 13.5,8.2 12,11.2 Z"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="1.3" />
    </svg>
  )
}

/** 三色堇：上两瓣粉紫、侧瓣与下大瓣亮紫、蜜金花心，紫色主题的点缀元素 */
function PansyFlower({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="6" cy="11" rx="4.2" ry="3.6" transform="rotate(-28 6 11)" fill="#b891e2" />
      <ellipse cx="18" cy="11" rx="4.2" ry="3.6" transform="rotate(28 18 11)" fill="#b891e2" />
      <ellipse cx="8.6" cy="5.8" rx="3.4" ry="2.9" transform="rotate(-18 8.6 5.8)" fill="#ecb0d8" />
      <ellipse cx="15.4" cy="5.8" rx="3.4" ry="2.9" transform="rotate(18 15.4 5.8)" fill="#ecb0d8" />
      <ellipse cx="12" cy="15.8" rx="5.6" ry="5" fill="#a06fd4" />
      <circle cx="12" cy="11.6" r="2.1" fill="#f0e3c6" />
    </svg>
  )
}

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    setIsMounted(true)
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const scrollToArticles = () => {
    document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToComments = () => {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-jungle-gradient">
      {/* Jungle / tulip silhouette background (image follows the color theme) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 silhouette-bg"
        style={{
          transform: isMounted
            ? `translateX(${mousePosition.x * -20}px) translateY(${mousePosition.y * -20}px)`
            : "none",
        }}
      />

      {/* Falling elements - lily petals (violet) / leaves (green); visibility driven purely by CSS */}
      {isMounted &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`lily-${i}`}
            className={`flower-layer-lily absolute opacity-35 z-10 ${i % 2 === 0 ? "text-honey-300" : "text-jungle-300"}`}
            initial={{
              x: Math.random() * dimensions.width,
              y: -20,
              rotate: Math.random() * 360,
              scale: 0.5 + Math.random() * 1.5,
            }}
            animate={{
              y: dimensions.height + 50,
              x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 100}px)`,
              rotate: Math.random() * 360 + 180,
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            <LilyFlower size={20 + Math.random() * 16} />
          </motion.div>
        ))}
      {isMounted &&
        Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            className="flower-layer-leaf absolute text-jungle-300 opacity-30 z-10"
            initial={{
              x: Math.random() * dimensions.width,
              y: -20,
              rotate: Math.random() * 360,
              scale: 0.5 + Math.random() * 1.5,
            }}
            animate={{
              y: dimensions.height + 50,
              x: `calc(${Math.random() * 100}vw + ${Math.sin(i) * 100}px)`,
              rotate: Math.random() * 360 + 180,
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            <Leaf size={20 + Math.random() * 15} />
          </motion.div>
        ))}

      {/* Pansy accents - green theme only, gentle sway */}
      {isMounted &&
        Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={`pansy-${i}`}
            className="flower-layer-pansy absolute z-10"
            style={{
              left: `${(i * 23 + 9) % 92 + 2}%`,
              top: `${14 + ((i * 47) % 68)}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 0.55 + (i % 3) * 0.12,
              scale: 0.55 + ((i * 13) % 10) / 14,
              rotate: [0, 10, -8, 0],
            }}
            transition={{
              opacity: { duration: 1.2, delay: 0.2 + i * 0.08 },
              scale: { duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeOut" },
              rotate: { duration: 7 + (i % 4) * 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <PansyFlower size={18 + ((i * 7) % 16)} />
          </motion.div>
        ))}

      <div className="container mx-auto px-4 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="relative h-32 w-32 md:h-40 md:w-40 animate-float"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/images/avatar.jpg"
                alt="择则责的博客标识"
                className="w-full h-full object-cover drop-shadow-xl bg-ring rounded-2xl"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg tracking-tight">
              择<span className="text-honey-300">则责</span>的个人博客
            </h1>

            <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto mb-8 drop-shadow">
              自己的房间
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={scrollToArticles}
                className="bg-jungle-600 hover:bg-jungle-700 text-white border-2 border-jungle-500"
              >
                <BookOpen className="h-5 w-5 mr-2" />开始阅读
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToComments}
                className="border-2 border-honey-300 text-white !bg-transparent hover:!bg-honey-900/40"
              >
                <MessageCircle className="h-5 w-5 mr-2" />去留言
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Jungle vines */}
      <div className="absolute left-0 top-0 h-full w-24 opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-0 left-4 w-4 h-full bg-contain bg-no-repeat bg-top vine-stroke"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 300"><path d="M12,0 Q16,50 8,100 Q0,150 12,200 Q24,250 12,300" stroke="%23a06fd4" fill="none" strokeWidth="2" /></svg>\')',
          }}
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute right-0 top-0 h-full w-24 opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-0 right-4 w-4 h-full bg-contain bg-no-repeat bg-top"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 300"><path d="M12,0 Q8,50 16,100 Q24,150 12,200 Q0,250 12,300" stroke="%23a06fd4" fill="none" strokeWidth="2" /></svg>\')',
          }}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>
    </section>
  )
}
