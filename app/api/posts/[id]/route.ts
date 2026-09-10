// 删除文章：需管理员
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import { isAdminRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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
