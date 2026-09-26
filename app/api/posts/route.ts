// 文章：读公开，写需管理员
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import { isAdminRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function dbUnavailable() {
  return NextResponse.json({ posts: [], error: "数据库未配置" }, { status: 200 })
}

export async function GET() {
  try {
    const sql = getSql()
    await ensureSchema()
    const rows = await sql`
      SELECT id, title, content, category, date, cover_id, video_id, created_at
      FROM posts
      ORDER BY created_at DESC
    `
    return NextResponse.json({
      posts: rows.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        category: r.category,
        date: r.date,
        ...(r.cover_id ? { coverId: r.cover_id } : {}),
        ...(r.video_id ? { videoId: r.video_id } : {}),
        ...(r.created_at ? { createdAt: new Date(r.created_at).toISOString() } : {}),
      })),
    })
  } catch (err) {
    console.error("GET /api/posts", err)
    return dbUnavailable()
  }
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { id, title, content, category, date, coverId, videoId } = body ?? {}
    if (
      typeof id !== "string" || !id ||
      typeof title !== "string" || !title.trim() ||
      typeof content !== "string" || !content.trim() ||
      typeof category !== "string" || !category ||
      typeof date !== "string" || !date
    ) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 })
    }
    const sql = getSql()
    await ensureSchema()
    await sql`
      INSERT INTO posts (id, title, content, category, date, cover_id, video_id)
      VALUES (${id}, ${title.trim()}, ${content.trim()}, ${category}, ${date}, ${coverId ?? null}, ${videoId ?? null})
      ON CONFLICT (id) DO NOTHING
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/posts", err)
    return NextResponse.json({ error: "发布失败，请重试" }, { status: 500 })
  }
}
