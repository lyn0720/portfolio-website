// 媒体列表：读公开（文章里的图片/视频需要展示）
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import type { MediaItem } from "@/lib/media-db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const sql = getSql()
    await ensureSchema()
    const rows = await sql`
      SELECT id, name, kind, mime, size, url, thumb, created_at
      FROM media
      ORDER BY created_at DESC
    `
    const media: MediaItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      kind: r.kind === "video" ? "video" : "image",
      mime: r.mime,
      size: Number(r.size),
      url: r.url,
      thumb: r.thumb || "",
      createdAt: new Date(r.created_at).getTime(),
    }))
    return NextResponse.json({ media })
  } catch (err) {
    console.error("GET /api/media", err)
    return NextResponse.json({ media: [], error: "数据库未配置" }, { status: 200 })
  }
}
