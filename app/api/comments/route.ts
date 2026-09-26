// 留言/评论：读公开、写公开（任何人都可以留言）
// 不带 postId → 全站留言板（post_id 为空）；带 postId → 对应文章的评论
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const postId = new URL(req.url).searchParams.get("postId")
    const sql = getSql()
    await ensureSchema()
    const rows = postId
      ? await sql`
          SELECT id, name, content, date FROM comments
          WHERE post_id = ${postId}
          ORDER BY created_at ASC
        `
      : await sql`
          SELECT id, name, content, date FROM comments
          WHERE post_id IS NULL
          ORDER BY created_at ASC
        `
    return NextResponse.json({ comments: rows })
  } catch (err) {
    console.error("GET /api/comments", err)
    return NextResponse.json({ comments: [], error: "数据库未配置" }, { status: 200 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = (typeof body?.name === "string" && body.name.trim()) || "匿名访客"
    const content = typeof body?.content === "string" ? body.content.trim() : ""
    const postId =
      typeof body?.postId === "string" && body.postId.trim() ? body.postId.trim() : null
    if (!content) {
      return NextResponse.json({ error: "留言内容不能为空" }, { status: 400 })
    }
    if (content.length > 200) {
      return NextResponse.json({ error: "留言内容不能超过 200 字" }, { status: 400 })
    }

    const sql = getSql()
    await ensureSchema()
    if (postId) {
      const exists = await sql`SELECT 1 FROM posts WHERE id = ${postId} LIMIT 1`
      if (exists.length === 0) {
        return NextResponse.json({ error: "文章不存在，无法评论" }, { status: 400 })
      }
    }
    const id = crypto.randomUUID()
    const date = new Date().toISOString().slice(0, 10)
    await sql`
      INSERT INTO comments (id, name, content, date, post_id)
      VALUES (${id}, ${name.slice(0, 20)}, ${content}, ${date}, ${postId})
    `
    return NextResponse.json({ comment: { id, name: name.slice(0, 20), content, date, postId } })
  } catch (err) {
    console.error("POST /api/comments", err)
    return NextResponse.json({ error: "留言失败，请重试" }, { status: 500 })
  }
}
