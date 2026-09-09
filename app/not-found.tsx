"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { Leaf } from "lucide-react"
import { useEffect, useState } from "react"

export default function NotFound() {
  // Use state to store window dimensions
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  const [isMounted, setIsMounted] = useState(false)

  // Only access window after component is mounted
  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })
    setIsMounted(true)

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Don't render animations until client-side
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jungle-gradient relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md p-8 rounded-lg border border-honey-300/20 shadow-xl">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img
                  src="/images/avatar.jpg"
                  alt="择则责的博客 - 迷失在丛林"
                  className="w-32 h-32 object-cover rounded-2xl"
                />
              </div>
              <h1 className="text-6xl font-bold text-white mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-honey-200 mb-4">迷失在博客丛林中</h2>
              <p className="text-stone-200 mb-8">
                哎呀！您似乎走错了路。这个页面并不存在，先回首页读篇文章吧。
              </p>
              <Button asChild className="bg-jungle-600 hover:bg-jungle-700 text-white">
                <Link href="/">
                  <Leaf className="mr-2 h-4 w-4" />返回首页
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-jungle-gradient relative overflow-hidden">
      {/* Jungle background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url('/images/django-jungle.png')` }}
      />

      {/* Floating leaves - only rendered client-side */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-jungle-300 opacity-30 z-10"
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

      <div className="container relative z-10">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md p-8 rounded-lg border border-honey-300/20 shadow-xl">
          <div className="text-center">
            <motion.div
              className="flex justify-center mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <img
                src="/images/avatar.jpg"
                alt="择则责的博客 - 迷失在丛林"
                className="w-32 h-32 object-cover rounded-2xl"
              />
            </motion.div>

            <h1 className="text-6xl font-bold text-white mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-honey-200 mb-4">迷失在博客丛林中</h2>
            <p className="text-stone-200 mb-8">
              哎呀！您似乎走错了路。这个页面并不存在，先回首页读篇文章吧。
            </p>

            <Button asChild className="bg-jungle-600 hover:bg-jungle-700 text-white">
              <Link href="/">
                <Leaf className="mr-2 h-4 w-4" />返回首页
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
