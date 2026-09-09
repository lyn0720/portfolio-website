"use client"

import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PenLine, Tag, Plus } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import { MediaImage } from "@/components/media-picker"

export default function BlogColumns() {
  const { categories, ready, postCountByCategory, categoryImages } = useCategories()

  const goCategories = () => {
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="columns" className="py-20 bg-stone-50 dark:bg-jungle-900/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-4 flex items-center justify-center gap-2">
            <PenLine className="h-6 w-6 text-jungle-500 dark:text-jungle-400" />
            博客专栏
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            你创建的每个分类都会在这里生成一个专栏。
          </p>
          <div className="h-1 w-20 bg-jungle-500 mx-auto mt-4"></div>
        </motion.div>

        {!ready ? (
          <div className="h-40" />
        ) : categories.length === 0 ? (
          <div className="max-w-xl mx-auto border-2 border-dashed border-stone-300 dark:border-jungle-700 rounded-lg py-14 text-center">
            <Tag className="h-10 w-10 mx-auto text-stone-400 dark:text-jungle-600 mb-3" />
            <p className="text-stone-600 dark:text-stone-300 mb-6">
              还没有专栏，创建分类后这里会自动生成专栏卡片
            </p>
            <Button onClick={goCategories} className="bg-jungle-600 hover:bg-jungle-700 text-white">
              <Plus className="h-4 w-4 mr-1" />
              去创建分类
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((name, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full flex flex-col border-stone-200 dark:border-jungle-800 hover:shadow-lg hover:border-jungle-300 dark:hover:border-jungle-600 transition-all duration-300 dark:bg-jungle-800/30">
                  <CardHeader>
                    {categoryImages[name] ? (
                      <MediaImage
                        id={categoryImages[name]}
                        alt={name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                    ) : (
                      <div className="rounded-full p-3 bg-jungle-100 dark:bg-jungle-800/60 w-fit mb-2">
                        <Tag className="h-6 w-6 text-jungle-500" />
                      </div>
                    )}
                    <CardTitle className="text-xl text-stone-800 dark:text-white">{name}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="w-fit bg-honey-100 dark:bg-honey-800/50 text-honey-800 dark:text-honey-200"
                    >
                      {postCountByCategory(name)} 篇文章
                    </Badge>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
