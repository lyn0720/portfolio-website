"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Film } from "lucide-react"
import { useCategories, useMediaUrl } from "@/hooks/use-categories"
import { MediaImage } from "@/components/media-picker"

function stripMedia(text: string) {
  return text.replace(/\[\[media:[^\]]*\]\]/g, "").trim()
}

function MediaBlock({ id }: { id: string }) {
  const { mediaItems } = useCategories()
  const url = useMediaUrl(id)
  const item = mediaItems.find((m) => m.id === id)
  if (!url || !item) return null
  if (item.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="my-5 rounded-lg max-w-full" />
  }
  return <video src={url} controls className="my-5 rounded-lg w-full" />
}

function PostContent({ content }: { content: string }) {
  const parts = content.split(/(\[\[media:[^\]]+\]\])/g)
  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        const match = part.match(/^\[\[media:([^\]]+)\]\]$/)
        if (match) return <MediaBlock key={index} id={match[1]} />
        if (!part.trim()) return null
        return (
          <p key={index} className="text-stone-700 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
            {part}
          </p>
        )
      })}
    </div>
  )
}

export default function PostPage() {
  const params = useParams<{ id: string }>()
  const { posts, ready } = useCategories()
  const post = posts.find((p) => p.id === params.id)

  const goBack = () => {
    window.location.href = "/"
  }

  if (!ready) {
    return <main className="min-h-screen bg-stone-50 dark:bg-jungle-950 pt-28" />
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-jungle-950 pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-white mb-4">文章不存在或已被删除</h1>
          <Button onClick={goBack} className="bg-jungle-600 hover:bg-jungle-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回首页
          </Button>
        </div>
      </main>
    )
  }

  const text = stripMedia(post.content)
  const readTime = `${Math.max(1, Math.ceil(text.length / 500))} 分钟`

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-jungle-950 pt-28 pb-16">
      <article className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={goBack}
          className="mb-6 text-honey-700 hover:text-honey-800 dark:text-honey-400 dark:hover:text-honey-300"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回首页
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 mb-6">
          <Badge variant="secondary" className="bg-honey-100 dark:bg-honey-900/50 text-honey-800 dark:text-honey-200">
            {post.category}
          </Badge>
          <span className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readTime}
          </span>
        </div>

        {post.coverId && (
          <MediaImage id={post.coverId} alt={post.title} className="w-full rounded-lg mb-8" />
        )}

        <PostContent content={post.content} />

        {post.videoId && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-stone-800 dark:text-white mb-3 flex items-center gap-2">
              <Film className="h-5 w-5 text-jungle-500" />
              视频附件
            </h2>
            <PostVideo id={post.videoId} />
          </div>
        )}
      </article>
    </main>
  )
}

function PostVideo({ id }: { id: string }) {
  const url = useMediaUrl(id)
  if (!url) return null
  return <video src={url} controls className="w-full rounded-lg" />
}
