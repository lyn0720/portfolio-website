// 媒体处理：文件校验（扩展名 + MIME + 魔数）、图片压缩、视频抽帧
// 实际文件存储在 Vercel Blob，数据库只记录元信息
export interface MediaItem {
  id: string
  name: string
  kind: "image" | "video"
  mime: string
  size: number
  width?: number
  height?: number
  url: string
  thumb: string
  createdAt: number
}

// 大小不设人为限制：走 Blob 客户端直传，不受接口请求体限制

const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif"]
const VIDEO_EXT = ["mp4", "webm", "mov"]
const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const VIDEO_MIMES = ["video/mp4", "video/webm", "video/quicktime"]

/** 通过文件头魔数识别真实类型，防止伪造扩展名 */
function sniffKind(bytes: Uint8Array): "image" | "video" | null {
  const b = bytes
  const ascii = (start: number, text: string) =>
    text.split("").every((c, i) => b[start + i] === c.charCodeAt(0))
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image" // JPEG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image" // PNG
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "image" // GIF
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image" // WebP
  if (ascii(4, "ftyp")) return "video" // MP4 / MOV
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video" // WebM
  return null
}

export type ValidationResult =
  | { ok: true; kind: "image" | "video" }
  | { ok: false; error: string }

export async function validateFile(file: File): Promise<ValidationResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  const isImage = IMAGE_EXT.includes(ext) && (IMAGE_MIMES.includes(file.type) || file.type === "")
  const isVideo = VIDEO_EXT.includes(ext) && (VIDEO_MIMES.includes(file.type) || file.type === "")
  if (!isImage && !isVideo) {
    return { ok: false, error: "不支持的文件格式，仅支持 JPG / PNG / WebP / GIF 图片与 MP4 / WebM / MOV 视频" }
  }
  const kind = isImage ? "image" : "video"
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (sniffKind(head) !== kind) {
    return { ok: false, error: "文件内容与格式不符，已阻止上传" }
  }
  return { ok: true, kind }
}

function canvasThumb(source: CanvasImageSource, sw: number, sh: number, targetW = 320): string {
  const canvas = document.createElement("canvas")
  canvas.width = targetW
  canvas.height = Math.max(1, Math.round((sh / sw) * targetW))
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/jpeg", 0.7)
}

/** JPEG 压缩：超过 300KB 或边长超 1920 时重编码为 JPEG 0.82；GIF 保留动画原样；PNG 保留原样（避免丢透明） */
export async function compressImage(file: File): Promise<{
  blob: Blob
  mime: string
  width: number
  height: number
  thumb: string
}> {
  const bitmap = await createImageBitmap(file)
  try {
    const maxDim = 1920
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    let blob: Blob = file
    let mime = file.type
    if (file.type === "image/jpeg" && (scale < 1 || file.size > 300 * 1024)) {
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.82),
      )
      mime = "image/jpeg"
    }
    return {
      blob,
      mime,
      width: bitmap.width,
      height: bitmap.height,
      thumb: canvasThumb(bitmap, bitmap.width, bitmap.height),
    }
  } finally {
    bitmap.close()
  }
}

/** 视频处理：生成抽帧缩略图，视频原样上传（浏览器端转码不现实） */
export async function prepareVideo(file: File): Promise<{
  blob: Blob
  mime: string
  width?: number
  height?: number
  thumb: string
}> {
  const url = URL.createObjectURL(file)
  const video = document.createElement("video")
  video.src = url
  video.muted = true
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve()
      video.onerror = () => reject(new Error("video load failed"))
      setTimeout(() => reject(new Error("video load timeout")), 8000)
    })
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve()
      video.currentTime = Math.min(1, (video.duration || 2) / 2)
      setTimeout(() => resolve(), 3000)
    })
    const w = video.videoWidth || 640
    const h = video.videoHeight || 360
    return { blob: file, mime: file.type || "video/mp4", width: w, height: h, thumb: canvasThumb(video, w, h, 480) }
  } finally {
    URL.revokeObjectURL(url)
  }
}
