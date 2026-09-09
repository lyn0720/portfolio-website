"use client"

import { motion } from "framer-motion"
import { Archive, Calendar, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCategories } from "@/hooks/use-categories"

export default function ArchiveTimeline() {
  const { posts, ready } = useCategories()

  const monthMap = new Map<string, { id: string; title: string; date: string; category: string }[]>()
  for (const p of posts) {
    const [year, month] = p.date.split("-")
    const label = `${year} 年 ${parseInt(month, 10)} 月`
    if (!monthMap.has(label)) monthMap.set(label, [])
    monthMap.get(label)!.push({ id: p.id, title: p.title, date: p.date.slice(5), category: p.category })
  }
  const archive = Array.from(monthMap.entries()).map(([month, items]) => ({ month, posts: items }))

  const goWrite = () => {
    window.location.href = "/write"
  }

  return (
    <section id="archive" className="py-20 bg-stone-50 dark:bg-jungle-900/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-4 flex items-center justify-center gap-2">
            <Archive className="h-6 w-6 text-jungle-500 dark:text-jungle-400" />
            文章归档
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            按时间倒序回溯每一篇文字，看看这段写作旅程走过的路。
          </p>
          <div className="h-1 w-20 bg-jungle-500 mx-auto mt-4"></div>
        </motion.div>

        {!ready ? (
          <div className="h-40" />
        ) : archive.length === 0 ? (
          <div className="max-w-xl mx-auto border-2 border-dashed border-stone-300 dark:border-jungle-700 rounded-lg py-14 text-center">
            <Archive className="h-10 w-10 mx-auto text-stone-400 dark:text-jungle-600 mb-3" />
            <p className="text-stone-600 dark:text-stone-300 mb-6">暂无归档，发布的文章会按月份自动出现在这里</p>
            <Button onClick={goWrite} className="bg-jungle-600 hover:bg-jungle-700 text-white">
              <PenLine className="h-4 w-4 mr-1" />
              去发布文章
            </Button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {archive.map((group, groupIndex) => (
              <motion.div
                key={group.month}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-jungle-500" />
                  {group.month}
                  <span className="text-sm font-normal text-stone-600 dark:text-stone-400">
                    （{group.posts.length} 篇）
                  </span>
                </h3>

                <div className="relative border-l-2 border-jungle-200 dark:border-jungle-800 ml-3 pl-6 space-y-4">
                  {group.posts.map((post, postIndex) => (
                    <div key={postIndex} className="relative">
                      <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-jungle-500 border-2 border-white dark:border-jungle-950"></span>
                      <a href={`/post/${post.id}`} className="group block">
                        <span className="text-sm text-honey-700 dark:text-honey-400 font-medium mr-3">
                          {post.date}
                        </span>
                        <span className="text-stone-800 dark:text-white font-medium group-hover:text-jungle-600 dark:group-hover:text-jungle-300 transition-colors">
                          {post.title}
                        </span>
                        <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-honey-100 dark:bg-honey-900/50 text-honey-800 dark:text-honey-200">
                          {post.category}
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
