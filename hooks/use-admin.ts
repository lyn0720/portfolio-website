"use client"

// 管理员登录态：查询 /api/auth/me，提供 login / logout
import { useCallback, useEffect, useState } from "react"

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    let active = true
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (active && typeof d?.isAdmin === "boolean") setIsAdmin(d.isAdmin)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  /** 登录成功返回 null，失败返回错误文案 */
  const login = useCallback(async (password: string): Promise<string | null> => {
    setChecking(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return (data as { error?: string }).error || "登录失败，请重试"
      setIsAdmin(true)
      return null
    } catch {
      return "网络错误，请重试"
    } finally {
      setChecking(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    setIsAdmin(false)
  }, [])

  return { isAdmin, ready, checking, login, logout }
}
