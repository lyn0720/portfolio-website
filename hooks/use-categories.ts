"use client"

import { useCallback, useEffect, useState } from "react"
import {
  compressImage,
  dbRemoveMedia,
  getAllMedia,
  getMedia,
  persistMedia,
  prepareVideo,
  validateFile,
  type MediaItem,
} from "@/lib/media-db"

export interface UserPost {
  id: string
  title: string
  content: string
  category: string
  date: string
  coverId?: string
  videoId?: string
}

const CATEGORIES_KEY = "zezhe_categories"
const POSTS_KEY = "zezhe_posts"
const CATEGORY_IMAGES_KEY = "zezhe_category_images"

/** 校验分类名称：非空、长度、与现有分类不重复（忽略大小写） */
export function validateCategoryName(name: string, existing: string[]): string | null {
  const trimmed = name.trim()
  if (!trimmed) return "分类名称不能为空"
  if (trimmed.length > 20) return "分类名称不能超过 20 个字符"
  if (existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return "已存在同名分类"
  return null
}

// 媒体对象 URL 缓存（模块级，同 id 复用）
const urlCache = new Map<string, string>()

/** 解析媒体 id 为可在 <img>/<video> 中使用的对象 URL */
export function useMediaUrl(id?: string | null) {
  const [url, setUrl] = useState<string | null>(() => (id ? urlCache.get(id) ?? null : null))
  useEffect(() => {
    let active = true
    if (!id) {
      setUrl(null)
      return
    }
    const cached = urlCache.get(id)
    if (cached) {
      setUrl(cached)
      return
    }
    getMedia(id).then((item) => {
      if (!active || !item) return
      const objectUrl = URL.createObjectURL(item.blob)
      urlCache.set(id, objectUrl)
      setUrl(objectUrl)
    })
    return () => {
      active = false
    }
  }, [id])
  return url
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [posts, setPosts] = useState<UserPost[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const rawCats = localStorage.getItem(CATEGORIES_KEY)
      if (rawCats) {
        const parsed = JSON.parse(rawCats)
        if (Array.isArray(parsed)) setCategories(parsed.filter((c) => typeof c === "string"))
      }
      const rawPosts = localStorage.getItem(POSTS_KEY)
      if (rawPosts) {
        const parsed = JSON.parse(rawPosts)
        if (Array.isArray(parsed)) setPosts(parsed as UserPost[])
      }
      const rawImages = localStorage.getItem(CATEGORY_IMAGES_KEY)
      if (rawImages) {
        const parsed = JSON.parse(rawImages)
        if (parsed && typeof parsed === "object") setCategoryImages(parsed)
      }
    } catch {
      // 数据损坏时按空数据处理，不抛错
    }
    getAllMedia()
      .then((items) => setMediaItems(items.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => {})
    setReady(true)
  }, [])

  const persistCategories = useCallback((next: string[]) => {
    setCategories(next)
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(next))
  }, [])

  const persistCategoryImages = useCallback((next: Record<string, string>) => {
    setCategoryImages(next)
    localStorage.setItem(CATEGORY_IMAGES_KEY, JSON.stringify(next))
  }, [])

  const addCategory = useCallback(
    (name: string): string | null => {
      const error = validateCategoryName(name, categories)
      if (error) return error
      persistCategories([...categories, name.trim()])
      return null
    },
    [categories, persistCategories],
  )

  const renameCategory = useCallback(
    (oldName: string, newName: string): string | null => {
      const others = categories.filter((c) => c !== oldName)
      const error = validateCategoryName(newName, others)
      if (error) return error
      const trimmed = newName.trim()
      persistCategories(categories.map((c) => (c === oldName ? trimmed : c)))
      // 同步更新引用了该分类的已发布文章与配图
      setPosts((prev) => {
        const next = prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p))
        localStorage.setItem(POSTS_KEY, JSON.stringify(next))
        return next
      })
      if (categoryImages[oldName] !== undefined) {
        const nextImages = { ...categoryImages }
        nextImages[trimmed] = nextImages[oldName]
        if (trimmed !== oldName) delete nextImages[oldName]
        persistCategoryImages(nextImages)
      }
      return null
    },
    [categories, categoryImages, persistCategories, persistCategoryImages],
  )

  const deleteCategory = useCallback(
    (name: string) => {
      persistCategories(categories.filter((c) => c !== name))
      if (categoryImages[name] !== undefined) {
        const nextImages = { ...categoryImages }
        delete nextImages[name]
        persistCategoryImages(nextImages)
      }
    },
    [categories, categoryImages, persistCategories, persistCategoryImages],
  )

  const setCategoryImage = useCallback(
    (name: string, mediaId: string | null) => {
      const nextImages = { ...categoryImages }
      if (mediaId) {
        nextImages[name] = mediaId
      } else {
        delete nextImages[name]
      }
      persistCategoryImages(nextImages)
    },
    [categoryImages, persistCategoryImages],
  )

  const addPost = useCallback(
    (title: string, content: string, category: string, coverId?: string, videoId?: string) => {
      const post: UserPost = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        content: content.trim(),
        category,
        date: new Date().toISOString().slice(0, 10),
        ...(coverId ? { coverId } : {}),
        ...(videoId ? { videoId } : {}),
      }
      setPosts((prev) => {
        const next = [post, ...prev]
        localStorage.setItem(POSTS_KEY, JSON.stringify(next))
        return next
      })
    },
    [],
  )

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      localStorage.setItem(POSTS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const postCountByCategory = useCallback(
    (name: string) => posts.filter((p) => p.category === name).length,
    [posts],
  )

  /** 上传媒体：校验 → 压缩/抽帧 → 入库，onProgress 汇报进度(0-100)与阶段文案 */
  const addMedia = useCallback(
    async (
      file: File,
      onProgress?: (progress: number, text: string) => void,
    ): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> => {
      try {
        onProgress?.(10, "校验文件…")
        const check = await validateFile(file)
        if (!check.ok) return { ok: false, error: check.error }
        onProgress?.(35, check.kind === "image" ? "正在压缩图片…" : "正在生成视频预览…")
        const prepared =
          check.kind === "image" ? await compressImage(file) : await prepareVideo(file)
        onProgress?.(75, "保存到本地媒体库…")
        const item = await persistMedia({
          name: file.name,
          kind: check.kind,
          blob: prepared.blob,
          mime: prepared.mime,
          width: prepared.width,
          height: prepared.height,
          thumb: prepared.thumb,
        })
        setMediaItems((prev) => [item, ...prev])
        onProgress?.(100, "上传完成")
        return { ok: true, item }
      } catch {
        return { ok: false, error: "文件处理失败，请重试" }
      }
    },
    [],
  )

  const removeMediaItem = useCallback((id: string) => {
    dbRemoveMedia(id).catch(() => {})
    const cached = urlCache.get(id)
    if (cached) {
      URL.revokeObjectURL(cached)
      urlCache.delete(id)
    }
    setMediaItems((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return {
    categories,
    posts,
    mediaItems,
    categoryImages,
    ready,
    addCategory,
    renameCategory,
    deleteCategory,
    setCategoryImage,
    addPost,
    deletePost,
    postCountByCategory,
    addMedia,
    removeMediaItem,
  }
}
