// 分类：读公开，写需管理员
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import { isAdminRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function dbUnavailable() {
  return NextResponse.json({ categories: [], error: "数据库未配置" }, { status: 200 })
}

export async function GET() {
  try {
    const sql = getSql()
    await ensureSchema()
    const rows = await sql`SELECT name, image_id FROM categories ORDER BY created_at ASC`
    return NextResponse.json({
      categories: rows.map((r) => ({ name: r.name, imageId: r.image_id ?? null })),
    })
  } catch (err) {
    console.error("GET /api/categories", err)
    return dbUnavailable()
  }
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    if (!name) return NextResponse.json({ error: "分类名称不能为空" }, { status: 400 })
    if (name.length > 20) return NextResponse.json({ error: "分类名称不能超过 20 个字符" }, { status: 400 })

    const sql = getSql()
    await ensureSchema()
    const inserted = await sql`
      INSERT INTO categories (name) VALUES (${name})
      ON CONFLICT (name) DO NOTHING
      RETURNING name
    `
    if (inserted.length === 0) {
      return NextResponse.json({ error: "已存在同名分类" }, { status: 409 })
    }
    return NextResponse.json({ ok: true, name })
  } catch (err) {
    console.error("POST /api/categories", err)
    return NextResponse.json({ error: "创建失败，请重试" }, { status: 500 })
  }
}
