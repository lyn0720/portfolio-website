"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { PenLine, Plus, Trash2, CheckCircle2, Film } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import MediaPicker, { MediaImage, MediaInserter } from "@/components/media-picker"

export default function WritePage() {
  const { categories, posts, ready, addCategory, addPost, deletePost } = useCategories()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [coverId, setCoverId] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ title?: string; content?: string; category?: string }>({})
  const [published, setPublished] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const contentRef = useRef<HTMLTextAreaElement>(null)

  // 在正文光标位置插入媒体令牌，发布后按顺序渲染为图片/视频
  const insertMediaToken = (id: string) => {
    const token = `[[media:${id}]]`
    const el = contentRef.current
    if (!el) {
      setContent((prev) => prev + token)
      return
    }
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? start
    setContent(content.slice(0, start) + token + content.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + token.length
    })
  }

  const [showCatForm, setShowCatForm] = useState(false)
  const [newCat, setNewCat] = useState("")
  const [catError, setCatError] = useState<string | null>(null)

  const handleQuickCreate = () => {
    const err = addCategory(newCat)
    if (err) {
      setCatError(err)
      return
    }
    setCategory(newCat.trim())
    setNewCat("")
    setShowCatForm(false)
    setCatError(null)
  }

  const handlePublish = () => {
    const next: typeof errors = {}
    if (!title.trim()) next.title = "请输入文章标题"
    if (!content.trim()) next.content = "请输入文章内容"
    if (!category) next.category = "请选择一个分类"
    setErrors(next)
    if (Object.keys(next).length > 0) return

    addPost(title, content, category, coverId ?? undefined, videoId ?? undefined)
    setPublished(true)
    setTitle("")
    setContent("")
    setCategory("")
    setCoverId(null)
    setVideoId(null)
    window.setTimeout(() => setPublished(false), 3000)
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-jungle-950 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-3 flex items-center justify-center gap-2">
            <PenLine className="h-7 w-7 text-jungle-500 dark:text-jungle-400" />
            发布文章
          </h1>
          <p className="text-stone-600 dark:text-stone-300">写下你想记录的，发布到你的博客。</p>
        </div>

        <Card className="border-stone-200 dark:border-jungle-800 dark:bg-jungle-900/30 mb-10">
          <CardHeader>
            <CardTitle className="text-stone-800 dark:text-white">新文章</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-stone-800 dark:text-white mb-1.5">
                标题
              </label>
              <input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入文章标题"
                className="w-full h-11 rounded-md border border-stone-300 dark:border-jungle-700 bg-white dark:bg-jungle-900/50 px-3 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-jungle-500"
              />
              {errors.title && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="post-category" className="block text-sm font-medium text-stone-800 dark:text-white mb-1.5">
                分类
              </label>
              <div className="flex gap-2">
                <select
                  id="post-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 h-11 rounded-md border border-stone-300 dark:border-jungle-700 bg-white dark:bg-jungle-900/50 px-3 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-jungle-500"
                >
                  <option value="">请选择分类</option>
                  {categories.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCatForm(!showCatForm)
                    setCatError(null)
                  }}
                  className="shrink-0 border-jungle-600 text-jungle-700 dark:text-jungle-300 hover:bg-jungle-50 dark:hover:bg-jungle-900"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  新建分类
                </Button>
              </div>
              {showCatForm && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={newCat}
                      onChange={(e) => {
                        setNewCat(e.target.value)
                        setCatError(null)
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
                      placeholder="输入新分类名称"
                      className="flex-1 h-10 rounded-md border border-stone-300 dark:border-jungle-700 bg-white dark:bg-jungle-900/50 px-3 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-jungle-500"
                    />
                    <Button
                      size="sm"
                      onClick={handleQuickCreate}
                      className="bg-jungle-600 hover:bg-jungle-700 text-white px-4 shrink-0"
                    >
                      添加
                    </Button>
                  </div>
                  {catError && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{catError}</p>}
                </div>
              )}
              {!showCatForm && errors.category && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
              )}
              {ready && categories.length === 0 && !showCatForm && (
                <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                  还没有分类，点击「新建分类」创建一个吧
                </p>
              )}
            </div>

            <div>
              <label htmlFor="post-content" className="block text-sm font-medium text-stone-800 dark:text-white mb-1.5">
                内容
              </label>
              <textarea
                id="post-content"
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始写吧……支持图文混排"
                rows={10}
                className="w-full rounded-md border border-stone-300 dark:border-jungle-700 bg-white dark:bg-jungle-900/50 px-3 py-2.5 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-jungle-500 resize-y"
              />
              <MediaInserter kind="image" onInsert={insertMediaToken} />
              <MediaInserter kind="video" onInsert={insertMediaToken} />
              {errors.content && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
            </div>

            <MediaPicker
              kind="image"
              value={coverId}
              onChange={setCoverId}
              label="文章封面（可选）"
              hint="支持从媒体库选择或上传新图片，JPG / PNG / WebP / GIF，大小不限"
            />

            <MediaPicker
              kind="video"
              value={videoId}
              onChange={setVideoId}
              label="视频附件（可选）"
              hint="支持 MP4 / WebM / MOV，大小不限"
            />

            <div className="flex items-center gap-4">
              <Button
                onClick={handlePublish}
                className="bg-jungle-600 hover:bg-jungle-700 text-white"
              >
                发布文章
              </Button>
              {published && (
                <span className="text-sm text-jungle-600 dark:text-jungle-300 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  发布成功
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-4">已发布的文章</h2>
          {!ready ? (
            <div className="h-20" />
          ) : posts.length === 0 ? (
            <div className="border-2 border-dashed border-stone-300 dark:border-jungle-700 rounded-lg py-10 text-center">
              <p className="text-stone-600 dark:text-stone-300">还没有发布过文章</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-stone-200 dark:border-jungle-800 dark:bg-jungle-900/30"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    {post.coverId && (
                      <MediaImage
                        id={post.coverId}
                        alt={post.title}
                        className="h-12 w-16 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 dark:text-white truncate">{post.title}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-2">
                        {post.category} · {post.date}
                        {post.videoId && (
                          <span className="inline-flex items-center gap-0.5 text-jungle-600 dark:text-jungle-300">
                            <Film className="h-3.5 w-3.5" />
                            含视频
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`删除文章 ${post.title}`}
                      onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                      className="h-8 w-8 shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 删除确认框 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-jungle-900 border-stone-200 dark:border-jungle-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-800 dark:text-white">确定要删除这篇文章吗？</AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600 dark:text-stone-300">
              「{deleteTarget?.title}」将被永久删除，此操作无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-300 dark:border-jungle-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-jungle-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deletePost(deleteTarget.id)
                setDeleteTarget(null)
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
