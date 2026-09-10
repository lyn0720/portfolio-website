// 媒体入库：客户端直传 Blob 成功后，登记元信息（需管理员）
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import { isAdminRequest } from "@/lib/auth"
import type { MediaItem } from "@/lib/media-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { id, url, name, kind, mime, thumb } = body ?? {}
    const size = Number(body?.size ?? 0)
    const width = body?.width != null ? Number(body.width) : undefined
    const height = body?.height != null ? Number(body.height) : undefined

    if (typeof id !== "string" || !id || typeof url !== "string" || !url.startsWith("https://")) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 })
    }
    if (kind !== "image" && kind !== "video") {
      return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 })
    }

    const sql = getSql()
    await ensureSchema()
    const inserted = await sql`
      INSERT INTO media (id, name, kind, mime, size, url, thumb)
      VALUES (${id}, ${String(name ?? "未命名")}, ${kind}, ${String(mime ?? "")}, ${Number.isFinite(size) ? size : 0}, ${url}, ${typeof thumb === "string" ? thumb : ""})
      ON CONFLICT (id) DO NOTHING
      RETURNING created_at
    `
    const createdAt = inserted[0] ? new Date(inserted[0].created_at).getTime() : Date.now()
    const item: MediaItem = {
      id,
      name: String(name ?? "未命名"),
      kind,
      mime: String(mime ?? ""),
      size: Number.isFinite(size) ? size : 0,
      ...(width != null && Number.isFinite(width) ? { width } : {}),
      ...(height != null && Number.isFinite(height) ? { height } : {}),
      url,
      thumb: typeof thumb === "string" ? thumb : "",
      createdAt,
    }
    return NextResponse.json({ media: item })
  } catch (err) {
    console.error("POST /api/media/confirm", err)
    return NextResponse.json({ error: "保存媒体信息失败" }, { status: 500 })
  }
}
