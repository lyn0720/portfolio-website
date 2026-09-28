// 文章单条操作：更新（PUT）/ 删除（DELETE），均需管理员
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import { isAdminRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  const { id } = await params
  try {
    const body = await req.json()
    const { title, content, category, coverId, videoId, isDraft } = body ?? {}
    const draft = isDraft === true
    // 存草稿允许标题/内容/分类为空，正式发布（isDraft=false 或未传）必须完整
    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof category !== "string" ||
      (!draft && (!title.trim() || !content.trim() || !category))
    ) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 })
    }
    const sql = getSql()
    await ensureSchema()
    const result = await sql`
      UPDATE posts
      SET title = ${title.trim()}, content = ${content.trim()}, category = ${category},
          cover_id = ${coverId ?? null}, video_id = ${videoId ?? null}, is_draft = ${draft}
      WHERE id = ${id}
      RETURNING id
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "文章不存在或已被删除" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("PUT /api/posts/[id]", err)
    return NextResponse.json({ error: "保存失败，请重试" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  const { id } = await params
  try {
    const sql = getSql()
    await ensureSchema()
    await sql`DELETE FROM posts WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/posts/[id]", err)
    return NextResponse.json({ error: "删除失败，请重试" }, { status: 500 })
  }
}
