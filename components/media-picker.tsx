"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FolderOpen, Loader2, X, Trash2, RefreshCw, ImagePlus, Film } from "lucide-react"
import { useCategories, useMediaUrl } from "@/hooks/use-categories"

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"

/** 通过媒体 id 渲染图片（内部解析对象 URL） */
export function MediaImage({ id, className, alt }: { id?: string | null; className?: string; alt?: string }) {
  const url = useMediaUrl(id)
  if (!url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt ?? ""} className={className} />
}

/** 通过媒体 id 渲染可播放视频 */
export function MediaVideo({ id, className }: { id?: string | null; className?: string }) {
  const url = useMediaUrl(id)
  if (!url) return null
  return <video src={url} controls className={className} />
}

interface MediaPickerProps {
  kind: "image" | "video"
  value?: string | null
  onChange: (id: string | null) => void
  label?: string
  hint?: string
}

/** 媒体上传/选择器：上传新文件（进度与校验）或从媒体库选择，选中后可预览 */
export default function MediaPicker({ kind, value, onChange, label, hint }: MediaPickerProps) {
  const { mediaItems, addMedia, removeMediaItem } = useCategories()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showLibrary, setShowLibrary] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setUploading(true)
    setProgress(0)
    const res = await addMedia(file, (p, text) => {
      setProgress(p)
      setStatusText(text)
    })
    setUploading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onChange(res.item.id)
  }

  const library = mediaItems.filter((m) => m.kind === kind)

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-stone-800 dark:text-white mb-1.5">{label}</label>
      )}

      {value ? (
        <div>
          <div className="w-fit max-w-full">
            {kind === "image" ? (
              <MediaImage
                id={value}
                alt="已选图片"
                className="max-h-48 rounded-md border border-stone-200 dark:border-jungle-700 object-cover"
              />
            ) : (
              <MediaVideo id={value} className="max-h-48 rounded-md border border-stone-200 dark:border-jungle-700" />
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(null)
                setShowLibrary(false)
              }}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              更换
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X className="h-3.5 w-3.5 mr-1" />
              移除
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1" />
              )}
              上传新文件
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLibrary(!showLibrary)}
              disabled={uploading}
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              从媒体库选择
            </Button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />

          {uploading && (
            <div className="mt-3 max-w-sm">
              <div className="h-2 rounded-full bg-stone-200 dark:bg-jungle-800 overflow-hidden">
                <div
                  className="h-full bg-jungle-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                {statusText} {progress}%
              </p>
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {!error && hint && <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{hint}</p>}

          {showLibrary && (
            <div className="mt-3 border border-stone-200 dark:border-jungle-700 rounded-md p-3 max-h-64 overflow-y-auto">
              {library.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">
                  媒体库为空，先上传一个文件吧
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {library.map((m) => (
                    <div key={m.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          onChange(m.id)
                          setShowLibrary(false)
                        }}
                        className="block w-full"
                        title={m.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.thumb}
                          alt={m.name}
                          className="h-16 w-full object-cover rounded border border-stone-200 dark:border-jungle-700 hover:border-jungle-500 transition-colors"
                        />
                      </button>
                      <button
                        type="button"
                        aria-label={`删除媒体 ${m.name}`}
                        onClick={() => removeMediaItem(m.id)}
                        className="absolute top-1 right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** 正文插入媒体：选择或上传后通过 onInsert 返回媒体 id，由调用方在光标处插入令牌 */
export function MediaInserter({
  kind,
  onInsert,
}: {
  kind: "image" | "video"
  onInsert: (id: string) => void
}) {
  const { mediaItems, addMedia, removeMediaItem } = useCategories()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setUploading(true)
    setProgress(0)
    const res = await addMedia(file, (p, text) => {
      setProgress(p)
      setStatusText(text)
    })
    setUploading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onInsert(res.item.id)
    setOpen(false)
  }

  const library = mediaItems.filter((m) => m.kind === kind)

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(!open)}>
          {kind === "image" ? (
            <ImagePlus className="h-4 w-4 mr-1" />
          ) : (
            <Film className="h-4 w-4 mr-1" />
          )}
          插入{kind === "image" ? "图片" : "视频"}
        </Button>
        {open && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            上传新文件
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {open && (
        <div className="mt-3 border border-stone-200 dark:border-jungle-700 rounded-md p-3 max-h-64 overflow-y-auto">
          {uploading && (
            <div className="mb-3">
              <div className="h-2 rounded-full bg-stone-200 dark:bg-jungle-800 overflow-hidden">
                <div
                  className="h-full bg-jungle-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                {statusText} {progress}%
              </p>
            </div>
          )}
          {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {library.length === 0 && !uploading ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">
              媒体库为空，点击「上传新文件」上传一个吧
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {library.map((m) => (
                <div key={m.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      onInsert(m.id)
                      setOpen(false)
                    }}
                    className="block w-full"
                    title={m.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.thumb}
                      alt={m.name}
                      className="h-16 w-full object-cover rounded border border-stone-200 dark:border-jungle-700 hover:border-jungle-500 transition-colors"
                    />
                  </button>
                  <button
                    type="button"
                    aria-label={`删除媒体 ${m.name}`}
                    onClick={() => removeMediaItem(m.id)}
                    className="absolute top-1 right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
