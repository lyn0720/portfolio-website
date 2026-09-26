"use client"

// 博客云端数据层：文章 / 分类 / 媒体全部走 API，多组件共享一份缓存
import { useEffect, useSyncExternalStore } from "react"
import { upload } from "@vercel/blob/client"
import {
  compressImage,
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
  /** 数据库 created_at 的 ISO 时间戳，用于展示精确到分的发布时间 */
  createdAt?: string
}

/** 校验分类名称：非空、长度、与现有分类不重复（忽略大小写） */
export function validateCategoryName(name: string, existing: string[]): string | null {
  const trimmed = name.trim()
  if (!trimmed) return "分类名称不能为空"
  if (trimmed.length > 20) return "分类名称不能超过 20 个字符"
  if (existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return "已存在同名分类"
  return null
}

// ---------------- 共享状态 ----------------

interface StoreState {
  categories: string[]
  posts: UserPost[]
  mediaItems: MediaItem[]
  categoryImages: Record<string, string>
  ready: boolean
  failed: boolean
}

const initialState: StoreState = {
  categories: [],
  posts: [],
  mediaItems: [],
  categoryImages: {},
  ready: false,
  failed: false,
}

let state: StoreState = initialState
const listeners = new Set<() => void>()

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return initialState
}

// ---------------- 请求工具 ----------------

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || `请求失败 (${res.status})`) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return data as T
}

function errorMessage(err: unknown): string {
  const status = (err as { status?: number })?.status
  if (status === 401) return "登录已过期，请重新登录"
  return err instanceof Error && err.message ? err.message : "操作失败，请重试"
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

// ---------------- 首次加载（单例） ----------------

let loadPromise: Promise<void> | null = null

function load(): Promise<void> {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const [postsRes, catsRes, mediaRes] = await Promise.all([
          fetchJson<{ posts: UserPost[] }>("/api/posts"),
          fetchJson<{ categories: { name: string; imageId: string | null }[] }>("/api/categories"),
          fetchJson<{ media: MediaItem[] }>("/api/media"),
        ])
        const cats = catsRes.categories ?? []
        setState({
          posts: postsRes.posts ?? [],
          categories: cats.map((c) => c.name),
          categoryImages: Object.fromEntries(
            cats.filter((c) => c.imageId).map((c) => [c.name, c.imageId as string]),
          ),
          mediaItems: mediaRes.media ?? [],
          ready: true,
          failed: false,
        })
      } catch (err) {
        console.error("博客数据加载失败", err)
        setState({ ready: true, failed: true })
      }
    })()
  }
  return loadPromise
}

// ---------------- Hooks ----------------

/** 解析媒体 id 为可直接用于 <img>/<video> 的云端 URL */
export function useMediaUrl(id?: string | null) {
  const { mediaItems } = useCategories()
  const item = id ? mediaItems.find((m) => m.id === id) : undefined
  return item?.url ?? null
}

export function useCategories() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    load()
  }, [])

  // ----- 分类 -----

  const addCategory = async (name: string): Promise<string | null> => {
    const error = validateCategoryName(name, state.categories)
    if (error) return error
    const trimmed = name.trim()
    try {
      await fetchJson("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      setState({ categories: [...state.categories, trimmed] })
      return null
    } catch (err) {
      return errorMessage(err)
    }
  }

  const renameCategory = async (oldName: string, newName: string): Promise<string | null> => {
    const others = state.categories.filter((c) => c !== oldName)
    const error = validateCategoryName(newName, others)
    if (error) return error
    const trimmed = newName.trim()
    try {
      await fetchJson(`/api/categories/${encodeURIComponent(oldName)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      setState({
        categories: state.categories.map((c) => (c === oldName ? trimmed : c)),
        posts: state.posts.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)),
        categoryImages:
          state.categoryImages[oldName] !== undefined
            ? Object.fromEntries(
                Object.entries(state.categoryImages).map(([k, v]) => (k === oldName ? [trimmed, v] : [k, v])),
              )
            : state.categoryImages,
      })
      return null
    } catch (err) {
      return errorMessage(err)
    }
  }

  const deleteCategory = async (name: string): Promise<void> => {
    try {
      await fetchJson(`/api/categories/${encodeURIComponent(name)}`, { method: "DELETE" })
      const nextImages = { ...state.categoryImages }
      delete nextImages[name]
      setState({
        categories: state.categories.filter((c) => c !== name),
        categoryImages: nextImages,
      })
    } catch (err) {
      console.error("删除分类失败", err)
    }
  }

  const setCategoryImage = async (name: string, mediaId: string | null): Promise<void> => {
    try {
      await fetchJson(`/api/categories/${encodeURIComponent(name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: mediaId }),
      })
      const nextImages = { ...state.categoryImages }
      if (mediaId) nextImages[name] = mediaId
      else delete nextImages[name]
      setState({ categoryImages: nextImages })
    } catch (err) {
      console.error("设置分类配图失败", err)
    }
  }

  // ----- 文章 -----

  const addPost = async (
    title: string,
    content: string,
    category: string,
    coverId?: string,
    videoId?: string,
  ): Promise<string | null> => {
    const post: UserPost = {
      id: genId(),
      title: title.trim(),
      content: content.trim(),
      category,
      date: today(),
      createdAt: new Date().toISOString(),
      ...(coverId ? { coverId } : {}),
      ...(videoId ? { videoId } : {}),
    }
    try {
      await fetchJson("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      })
      setState({ posts: [post, ...state.posts] })
      return null
    } catch (err) {
      return errorMessage(err)
    }
  }

  const updatePost = async (
    id: string,
    data: { title: string; content: string; category: string; coverId?: string; videoId?: string },
  ): Promise<string | null> => {
    try {
      await fetchJson(`/api/posts/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          content: data.content.trim(),
          category: data.category,
          ...(data.coverId ? { coverId: data.coverId } : {}),
          ...(data.videoId ? { videoId: data.videoId } : {}),
        }),
      })
      setState({
        posts: state.posts.map((p) => {
          if (p.id !== id) return p
          const next: UserPost = {
            ...p,
            title: data.title.trim(),
            content: data.content.trim(),
            category: data.category,
          }
          if (data.coverId) next.coverId = data.coverId
          else delete next.coverId
          if (data.videoId) next.videoId = data.videoId
          else delete next.videoId
          return next
        }),
      })
      return null
    } catch (err) {
      return errorMessage(err)
    }
  }

  const deletePost = async (id: string): Promise<void> => {
    try {
      await fetchJson(`/api/posts/${encodeURIComponent(id)}`, { method: "DELETE" })
      setState({ posts: state.posts.filter((p) => p.id !== id) })
    } catch (err) {
      console.error("删除文章失败", err)
    }
  }

  const postCountByCategory = (name: string) => state.posts.filter((p) => p.category === name).length

  // ----- 媒体 -----

  /** 校验 → 压缩/抽帧 → 客户端直传 Blob → 登记入库，onProgress 汇报进度(0-100)与阶段文案 */
  const addMedia = async (
    file: File,
    onProgress?: (progress: number, text: string) => void,
  ): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> => {
    try {
      onProgress?.(8, "校验文件…")
      const check = await validateFile(file)
      if (!check.ok) return { ok: false, error: check.error }
      onProgress?.(25, check.kind === "image" ? "正在压缩图片…" : "正在生成视频预览…")
      const prepared =
        check.kind === "image" ? await compressImage(file) : await prepareVideo(file)
      onProgress?.(55, "上传到云端…")
      const id = genId()
      const safeName = file.name.replace(/[^\w.\-\u4e00-\u9fa5]+/g, "_") || "file"
      const blob = await upload(`media/${id}/${safeName}`, prepared.blob, {
        access: "public",
        handleUploadUrl: "/api/media/upload",
      })
      onProgress?.(90, "保存媒体信息…")
      const data = await fetchJson<{ media: MediaItem }>("/api/media/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          url: blob.url,
          name: file.name,
          kind: check.kind,
          mime: prepared.mime,
          size: prepared.blob.size,
          width: prepared.width,
          height: prepared.height,
          thumb: prepared.thumb,
        }),
      })
      setState({ mediaItems: [data.media, ...state.mediaItems] })
      onProgress?.(100, "上传完成")
      return { ok: true, item: data.media }
    } catch (err) {
      return { ok: false, error: errorMessage(err) }
    }
  }

  const removeMediaItem = async (id: string): Promise<void> => {
    try {
      await fetchJson(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" })
      setState({ mediaItems: state.mediaItems.filter((m) => m.id !== id) })
    } catch (err) {
      console.error("删除媒体失败", err)
    }
  }

  return {
    ...snapshot,
    addCategory,
    renameCategory,
    deleteCategory,
    setCategoryImage,
    addPost,
    updatePost,
    deletePost,
    postCountByCategory,
    addMedia,
    removeMediaItem,
  }
}
