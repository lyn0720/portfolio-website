// 留言：读公开、写公开（任何人都可以留言）
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const sql = getSql()
    await ensureSchema()
    const rows = await sql`
      SELECT id, name, content, date FROM comments ORDER BY created_at ASC
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
    if (!content) {
      return NextResponse.json({ error: "留言内容不能为空" }, { status: 400 })
    }
    if (content.length > 200) {
      return NextResponse.json({ error: "留言内容不能超过 200 字" }, { status: 400 })
    }

    const sql = getSql()
    await ensureSchema()
    const id = crypto.randomUUID()
    const date = new Date().toISOString().slice(0, 10)
    await sql`
      INSERT INTO comments (id, name, content, date)
      VALUES (${id}, ${name.slice(0, 20)}, ${content}, ${date})
    `
    return NextResponse.json({ comment: { id, name: name.slice(0, 20), content, date } })
  } catch (err) {
    console.error("POST /api/comments", err)
    return NextResponse.json({ error: "留言失败，请重试" }, { status: 500 })
  }
}
