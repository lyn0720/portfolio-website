"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MessageCircle, PenLine, Trash2 } from "lucide-react"
import { useAdmin } from "@/hooks/use-admin"

type Message = {
  id: string
  name: string
  content: string
  date: string
}

export default function ReaderComments() {
  const { isAdmin } = useAdmin()
  const [messages, setMessages] = useState<Message[]>([])
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/comments")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        const list = Array.isArray(d?.comments) ? d.comments : []
        setMessages(list.slice().reverse()) // 最新的在前
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: trimmedContent }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data as { error?: string }).error || "留言失败，请重试")
        return
      }
      setMessages((prev) => [data.comment as Message, ...prev])
      setName("")
      setContent("")
    } catch {
      setError("网络错误，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(target.id)}`, { method: "DELETE" })
      if (!res.ok) return
      setMessages((prev) => prev.filter((m) => m.id !== target.id))
    } catch {
      // 失败时保留原留言
    }
  }

  return (
    <section id="comments" className="py-20 bg-white dark:bg-jungle-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-4 flex items-center justify-center gap-2">
            <MessageCircle className="h-6 w-6 text-jungle-500 dark:text-jungle-400" />
            到此一游
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            你，你可有何话说？
          </p>
          <div className="h-1 w-20 bg-jungle-500 mx-auto mt-4"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12"
        >
          <Card className="border-stone-200 dark:border-jungle-800 bg-white dark:bg-jungle-900/30">
            <CardHeader className="pb-2">
              <p className="font-medium text-stone-800 dark:text-white flex items-center gap-2">
                <PenLine className="h-5 w-5 text-jungle-600 dark:text-jungle-400" />
                留下你的足迹
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-name">昵称（选填）</Label>
                <Input
                  id="guest-name"
                  placeholder="怎么称呼你？"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-message">留言内容</Label>
                <Textarea
                  id="guest-message"
                  placeholder="写点什么吧…"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={200}
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-jungle-600 hover:bg-jungle-700 text-white"
              >
                {submitting ? "提交中…" : "提交留言"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {!loaded ? (
          <div className="h-10" />
        ) : messages.length === 0 ? (
          <p className="text-center text-stone-500 dark:text-stone-400">
            还没有人留言，快来抢沙发！
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-stone-200 dark:border-jungle-800 bg-white dark:bg-jungle-900/30 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-honey-100 text-honey-800 dark:bg-honey-900/60 dark:text-honey-200">
                          {message.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-stone-800 dark:text-white flex-1 min-w-0 truncate">
                        {message.name}
                      </p>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`删除 ${message.name} 的留言`}
                          onClick={() => setDeleteTarget(message)}
                          className="h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-stone-600 dark:text-stone-300 whitespace-pre-wrap">{message.content}</p>
                  </CardContent>
                  <CardFooter>
                    <span className="text-sm text-stone-600 dark:text-stone-400">{message.date}</span>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 删除留言确认框（仅管理员可见入口） */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-jungle-900 border-stone-200 dark:border-jungle-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-800 dark:text-white">确定要删除这条留言吗？</AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600 dark:text-stone-300">
              {deleteTarget?.name} 的留言将被永久删除，此操作无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-300 dark:border-jungle-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-jungle-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
