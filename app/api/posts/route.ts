// 文章：读公开，写需管理员
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import { isAdminRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function dbUnavailable() {
  return NextResponse.json({ posts: [], error: "数据库未配置" }, { status: 200 })
}

export async function GET(req: Request) {
  try {
    // 默认只返回已发布文章；?drafts=1 仅管理员可用，返回草稿箱
    const wantDrafts = new URL(req.url).searchParams.get("drafts") === "1"
    if (wantDrafts && !(await isAdminRequest(req))) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    const sql = getSql()
    await ensureSchema()
    const rows = wantDrafts
      ? await sql`
          SELECT id, title, content, category, date, cover_id, video_id, created_at, is_draft
          FROM posts
          WHERE is_draft = true
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT id, title, content, category, date, cover_id, video_id, created_at, is_draft
          FROM posts
          WHERE is_draft = false
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
        ...(r.is_draft ? { isDraft: true } : {}),
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
    const { id, title, content, category, date, coverId, videoId, isDraft } = body ?? {}
    const draft = isDraft === true
    // 草稿允许标题/内容/分类为空，正式发布必须完整
    if (
      typeof id !== "string" || !id ||
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof category !== "string" ||
      typeof date !== "string" || !date ||
      (!draft && (!title.trim() || !content.trim() || !category))
    ) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 })
    }
    const sql = getSql()
    await ensureSchema()
    await sql`
      INSERT INTO posts (id, title, content, category, date, cover_id, video_id, is_draft)
      VALUES (${id}, ${title.trim()}, ${content.trim()}, ${category}, ${date}, ${coverId ?? null}, ${videoId ?? null}, ${draft})
      ON CONFLICT (id) DO NOTHING
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/posts", err)
    return NextResponse.json({ error: "发布失败，请重试" }, { status: 500 })
  }
}
