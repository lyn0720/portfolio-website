// 媒体上传令牌：签发客户端直传 Blob 的凭证（大文件不经过本函数，绕开请求体限制）
import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { isAdminRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN 未配置" }, { status: 500 })
  }
  try {
    const body = (await req.json()) as HandleUploadBody
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        addRandomSuffix: false,
        cacheControlMaxAge: 60 * 60 * 24 * 365, // 媒体不可变，长缓存
        tokenPayload: JSON.stringify({ v: 1 }),
      }),
      onUploadCompleted: async () => {
        // 实际入库由 /api/media/confirm 显式完成，这里无需处理
      },
    })
    return NextResponse.json(json)
  } catch (err) {
    console.error("POST /api/media/upload", err)
    const message = err instanceof Error && err.message.includes("content type") ? "不支持的文件格式" : "上传失败，请重试"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
