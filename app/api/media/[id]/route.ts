// 删除媒体：同时清理 Blob 文件与数据库记录（需管理员）
import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
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
    const rows = await sql`SELECT url FROM media WHERE id = ${id}`
    if (rows.length > 0) {
      try {
        await del(rows[0].url)
      } catch (blobErr) {
        // Blob 清理失败不阻塞记录删除
        console.error("del blob failed", blobErr)
      }
      await sql`DELETE FROM media WHERE id = ${id}`
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/media/[id]", err)
    return NextResponse.json({ error: "删除失败，请重试" }, { status: 500 })
  }
}
