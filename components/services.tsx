"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Tags, Tag, Plus, Pencil, Trash2 } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import MediaPicker, { MediaImage } from "@/components/media-picker"

export default function CategoryTags() {
  const {
    categories,
    ready,
    addCategory,
    renameCategory,
    deleteCategory,
    postCountByCategory,
    categoryImages,
    setCategoryImage,
  } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newCatImage, setNewCatImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleCreate = () => {
    const err = addCategory(newName)
    if (err) {
      setError(err)
      return
    }
    setCategoryImage(newName.trim(), newCatImage)
    setNewName("")
    setNewCatImage(null)
    setShowForm(false)
    setError(null)
  }

  const startEdit = (name: string) => {
    setEditing(name)
    setEditName(name)
    setEditError(null)
  }

  const handleSaveEdit = () => {
    if (editing === null) return
    const err = renameCategory(editing, editName)
    if (err) {
      setEditError(err)
      return
    }
    setEditing(null)
    setEditError(null)
  }

  const handleDelete = (name: string) => {
    setDeleteTarget(name)
  }

  const tagGroups = [
    {
      name: "日常",
      hot: true,
    },
    {
      name: "感悟",
      hot: true,
    },
    {
      name: "夜跑",
      hot: true,
    },
    {
      name: "做饭",
      hot: true,
    },
    { name: "书单" },
    { name: "电影" },
    { name: "徒步" },
    { name: "旅行" },
    { name: "家人" },
    { name: "朋友" },
    { name: "季节" },
    { name: "回忆" },
    { name: "摄影" },
    { name: "手账" },
    { name: "城市漫步" },
    { name: "独处" },
  ]

  return (
    <section id="categories" className="py-20 bg-white dark:bg-jungle-950 relative overflow-hidden">
      {/* Jungle vines decoration */}
      <div className="absolute -left-4 top-0 w-24 h-full opacity-10 pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-full h-full vine-stroke"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 600"><path d="M30,0 Q60,100 20,200 Q-20,300 30,400 Q80,500 30,600" stroke="%23a06fd4" fill="none" strokeWidth="5" /></svg>\')',
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        />
      </div>

      <div className="absolute -right-4 top-0 w-24 h-full opacity-10 pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-full h-full"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 600"><path d="M70,0 Q40,100 80,200 Q120,300 70,400 Q20,500 70,600" stroke="%23a06fd4" fill="none" strokeWidth="5" /></svg>\')',
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
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
            <Tags className="h-6 w-6 text-jungle-500 dark:text-jungle-400" />
            分类与标签
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
            在这里创建和管理属于你的文章分类。
          </p>
          <div className="h-1 w-20 bg-jungle-500 mx-auto mt-4"></div>
        </motion.div>

        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-8">
            {showForm ? (
              <div className="w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value)
                      setError(null)
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="输入分类名称"
                    className="flex-1 h-10 rounded-md border border-stone-300 dark:border-jungle-700 bg-white dark:bg-jungle-900/50 px-3 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-jungle-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    className="bg-jungle-600 hover:bg-jungle-700 text-white px-4"
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setNewName("")
                      setError(null)
                    }}
                  >
                    取消
                  </Button>
                </div>
                <div className="mt-3">
                  <MediaPicker
                    kind="image"
                    value={newCatImage}
                    onChange={setNewCatImage}
                    label="分类配图（可选）"
                    hint="支持 JPG / PNG / WebP / GIF，大小不限"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
              </div>
            ) : (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-jungle-600 hover:bg-jungle-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                创建新分类
              </Button>
            )}
          </div>

          {!ready ? (
            <div className="h-40" />
          ) : categories.length === 0 ? (
            <div className="border-2 border-dashed border-stone-300 dark:border-jungle-700 rounded-lg py-12 text-center">
              <Tags className="h-10 w-10 mx-auto text-stone-400 dark:text-jungle-600 mb-3" />
              <p className="text-stone-600 dark:text-stone-300">
                还没有分类，点击上方「创建新分类」创建第一个吧
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-stone-200 dark:border-jungle-800 dark:bg-jungle-900/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4 flex items-center gap-3">
                      {categoryImages[name] ? (
                        <MediaImage
                          id={categoryImages[name]}
                          alt={name}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="rounded-full p-2 bg-jungle-100 dark:bg-jungle-800/60 shrink-0">
                          <Tag className="h-4 w-4 text-jungle-500" />
                        </div>
                      )}
                      {editing === name ? (
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-2">
                            <input
                              autoFocus
                              value={editName}
                              onChange={(e) => {
                                setEditName(e.target.value)
                                setEditError(null)
                              }}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                              className="flex-1 h-9 rounded-md border border-stone-300 dark:border-jungle-700 bg-white dark:bg-jungle-900/50 px-2 text-sm text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-jungle-500"
                            />
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="bg-jungle-600 hover:bg-jungle-700 text-white px-3"
                            >
                              保存
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditing(null)}
                              className="px-3"
                            >
                              取消
                            </Button>
                          </div>
                          {editError && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-stone-800 dark:text-white block truncate">
                              {name}
                            </span>
                            <span className="text-sm text-stone-600 dark:text-stone-400">
                              {postCountByCategory(name)} 篇
                            </span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`编辑分类 ${name}`}
                              onClick={() => startEdit(name)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`删除分类 ${name}`}
                              onClick={() => handleDelete(name)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto flex flex-wrap justify-center gap-3"
        >
          {tagGroups.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`cursor-pointer transition-colors ${
                tag.hot
                  ? "text-base px-4 py-1.5 bg-jungle-600 text-white hover:bg-jungle-700"
                  : "bg-honey-100 dark:bg-honey-900/50 text-honey-800 dark:text-honey-200 hover:bg-honey-200 dark:hover:bg-honey-800"
              }`}
            >
              {tag.name}
            </Badge>
          ))}
        </motion.div>
      </div>

      {/* 删除分类确认框 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-jungle-900 border-stone-200 dark:border-jungle-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-stone-800 dark:text-white">确定要删除这个分类吗？</AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600 dark:text-stone-300">
              分类「{deleteTarget}」将被删除，此操作无法恢复。已发布文章会保留，但不再归属该分类。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-stone-300 dark:border-jungle-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-jungle-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteCategory(deleteTarget)
                setDeleteTarget(null)
              }}
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
