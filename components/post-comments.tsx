"use client"

// 文章评论：所有访客可读可评，删除仅限管理员
import { useEffect, useState } from "react"
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
import { formatDateTime } from "@/lib/utils"

type PostComment = {
  id: string
  name: string
  content: string
  date: string
  createdAt?: string
}

export default function PostComments({ postId }: { postId: string }) {
  const { isAdmin } = useAdmin()
  const [comments, setComments] = useState<PostComment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PostComment | null>(null)

  useEffect(() => {
    let active = true
    fetch(`/api/comments?postId=${encodeURIComponent(postId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        const list = Array.isArray(d?.comments) ? d.comments : []
        setComments(list.slice().reverse()) // 最新的在前
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [postId])

  const handleSubmit = async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), content: trimmedContent, postId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data as { error?: string }).error || "评论失败，请重试")
        return
      }
      setComments((prev) => [data.comment as PostComment, ...prev])
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
      setComments((prev) => prev.filter((m) => m.id !== target.id))
    } catch {
      // 失败时保留原评论
    }
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-jungle-500 dark:text-jungle-400" />
        评论
        {loaded && comments.length > 0 && (
          <span className="text-base font-normal text-stone-500 dark:text-stone-400">
            （{comments.length}）
          </span>
        )}
        <span className="text-sm font-normal text-stone-500 dark:text-stone-400 ml-1">
          和平讨论，不要吵架
        </span>
      </h2>

      <Card className="border-stone-200 dark:border-jungle-800 bg-white dark:bg-jungle-900/30 mb-8">
        <CardHeader className="pb-2">
          <p className="font-medium text-stone-800 dark:text-white flex items-center gap-2">
            <PenLine className="h-5 w-5 text-jungle-600 dark:text-jungle-400" />
            说点什么吧
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`comment-name-${postId}`}>昵称（选填）</Label>
            <Input
              id={`comment-name-${postId}`}
              placeholder="怎么称呼你？"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`comment-content-${postId}`}>评论内容</Label>
            <Textarea
              id={`comment-content-${postId}`}
              placeholder="写下你的想法…"
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
            {submitting ? "提交中…" : "发表评论"}
          </Button>
        </CardContent>
      </Card>

      {!loaded ? (
        <div className="h-10" />
      ) : comments.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-400">
          还没有评论，来抢个沙发吧！
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card
              key={comment.id}
              className="border-stone-200 dark:border-jungle-800 bg-white dark:bg-jungle-900/30"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-honey-100 text-honey-800 dark:bg-honey-900/60 dark:text-honey-200 text-sm">
                      {comment.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-stone-800 dark:text-white flex-1 min-w-0 truncate">
                    {comment.name}
                  </p>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`删除 ${comment.name} 的评论`}
                      onClick={() => setDeleteTarget(comment)}
                      className="h-8 w-8 shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <p className="text-stone-600 dark:text-stone-300 whitespace-pre-wrap">{comment.content}</p>
              </CardContent>
              <CardFooter>
                <span className="text-sm text-stone-600 dark:text-stone-400">
                  {formatDateTime(comment.createdAt) ?? comment.date}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 删除评论确认框（仅管理员可见入口） */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-jungle-900 border-stone-200 dark:border-jungle-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-800 dark:text-white">确定要删除这条评论吗？</AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600 dark:text-stone-300">
              {deleteTarget?.name} 的评论将被永久删除，此操作无法恢复。
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
