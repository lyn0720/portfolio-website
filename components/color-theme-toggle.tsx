"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

type ColorTheme = "green" | "violet"

const STORAGE_KEY = "zezhe-color-theme"

/** 读当前色板（服务端渲染时返回 null，仅客户端可用） */
function getColorTheme(): ColorTheme {
  return document.documentElement.classList.contains("theme-violet") ? "violet" : "green"
}

export default function ColorThemeToggle() {
  const [colorTheme, setColorTheme] = useState<ColorTheme | null>(null)

  useEffect(() => {
    setColorTheme(getColorTheme())
    // 同步其他标签页的色板选择
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const value = e.newValue === "violet" ? "violet" : "green"
        applyColorTheme(value, false)
        setColorTheme(value)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const applyColorTheme = (value: ColorTheme, persist = true) => {
    const root = document.documentElement
    root.classList.toggle("theme-violet", value === "violet")
    root.classList.toggle("theme-green", value === "green")
    if (persist) window.localStorage.setItem(STORAGE_KEY, value)
    setColorTheme(value)
  }

  const toggle = () => {
    const next = getColorTheme() === "violet" ? "green" : "violet"
    applyColorTheme(next)
  }

  const isViolet = colorTheme === "violet"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-full transition-transform duration-150 active:scale-90"
      aria-label={isViolet ? "切换为绿色色调" : "切换为紫色色调"}
      title={isViolet ? "换成绿色色调" : "换成紫色色调"}
    >
      <Palette
        className={`h-5 w-5 transition-all duration-300 ${
          colorTheme === null ? "opacity-0" : isViolet ? "text-jungle-500 rotate-0 scale-100" : "text-honey-600 rotate-180 scale-100"
        }`}
      />
    </Button>
  )
}
