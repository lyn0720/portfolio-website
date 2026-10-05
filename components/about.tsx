"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Clock, ArrowRight, Flame, PenLine } from "lucide-react"
import { useCategories, useMediaUrl } from "@/hooks/use-categories"

export default function LatestArticles() {
  const { posts, ready, mediaItems } = useCategories()

  const featured = posts[0]
  const coverUrl = useMediaUrl(featured?.coverId)
  const articles = posts.slice(1, 6)
  // 媒体 id → 云端 URL，供列表卡片解析封面图
  const mediaUrlMap = new Map(mediaItems.map((m) => [m.id, m.url]))

  const stripMedia = (text: string) => text.replace(/\[\[media:[^\]]*\]\]/g, "").trim()
  const readTime = (text: string) => `${Math.max(1, Math.ceil(stripMedia(text).length / 500))} 分钟`
  const excerpt = (text: string) => {
    const plain = stripMedia(text)
    return plain.length > 60 ? `${plain.slice(0, 60)}…` : plain || "图文内容，点击查看"
  }

  const goWrite = () => {
    window.location.href = "/write"
  }

  return (
    <section id="articles" className="py-20 bg-white dark:bg-jungle-950 relative overflow-hidden">
      {/* Jungle background decoration (image follows the color theme) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat silhouette-bg"
          style={{
            backgroundSize: "80%",
            filter: "blur(2px)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-4 flex items-center justify-center gap-2">
            <BookOpen className="h-6 w-6 text-jungle-500 dark:text-jungle-400" />
            我的文章
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            写自己想写的，记录能够记录的
          </p>
          <div className="h-1 w-20 bg-jungle-500 mx-auto mt-4"></div>
        </motion.div>

        {!ready ? (
          <div className="h-[420px]" />
        ) : posts.length === 0 ? (
          <div className="max-w-xl mx-auto border-2 border-dashed border-stone-300 dark:border-jungle-700 rounded-lg py-16 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-stone-400 dark:text-jungle-600 mb-3" />
            <p className="text-stone-600 dark:text-stone-300 mb-6">还没有文章，写下你的第一篇吧</p>
            <Button onClick={goWrite} className="bg-jungle-600 hover:bg-jungle-700 text-white">
              <PenLine className="h-4 w-4 mr-1" />
              去发布文章
            </Button>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Featured article */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="h-full"
          >
            {featured && (
              <Card
                className="h-full border-none overflow-hidden relative group cursor-pointer"
                onClick={() => (window.location.href = `/post/${featured.id}`)}
              >
                <div className="absolute inset-0">
                  <img
                    src={coverUrl ?? "/images/django-jungle.png"}
                    alt={featured.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-jungle-950/95 via-jungle-900/60 to-jungle-900/30" />
                </div>
                <CardContent className="relative z-10 p-8 flex flex-col justify-end h-full min-h-[400px]">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-jungle-600 hover:bg-jungle-700 text-white gap-1">
                      <Flame className="h-3 w-3" />置顶精选
                    </Badge>
                    <Badge variant="outline" className="border-honey-300/60 text-honey-200">
                      {featured.category}
                    </Badge>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{featured.title}</h3>
                  <p className="text-stone-200 mb-6 leading-relaxed">{excerpt(featured.content)}</p>
                  <div className="flex items-center gap-4 text-sm text-jungle-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featured.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {readTime(featured.content)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Article list */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 h-full justify-between"
          >
            {articles.map((article) => (
              <Card
                key={article.id}
                onClick={() => (window.location.href = `/post/${article.id}`)}
                className="group overflow-hidden border-stone-200 dark:border-jungle-800 hover:shadow-md hover:border-jungle-300 dark:hover:border-jungle-600 transition-all duration-300 dark:bg-jungle-900/30 cursor-pointer"
              >
                <div className="flex h-full">
                  <div className="relative w-28 sm:w-36 md:w-44 shrink-0 overflow-hidden">
                    <img
                      src={mediaUrlMap.get(article.coverId ?? "") ?? "/images/django-jungle.png"}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="bg-honey-100 dark:bg-honey-900/50 text-honey-800 dark:text-honey-200"
                      >
                        {article.category}
                      </Badge>
                      <span className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {article.date}
                      </span>
                      <span className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {readTime(article.content)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-1 group-hover:text-jungle-600 dark:group-hover:text-jungle-300 line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 line-clamp-2">{excerpt(article.content)}</p>
                  </CardContent>
                </div>
              </Card>
            ))}

            <Button
              variant="ghost"
              onClick={goWrite}
              className="text-honey-700 hover:text-honey-800 dark:text-honey-400 dark:hover:text-honey-300 self-center"
            >
              去写一篇文章 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        </div>
        )}
      </div>
    </section>
  )
}
