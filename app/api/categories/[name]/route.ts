// 单个分类：重命名 / 设置配图 / 删除，均需管理员
import { NextResponse } from "next/server"
import { ensureSchema, getSql } from "@/lib/db"
import { isAdminRequest } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function safeDecode(raw: string) {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

/** 重命名（body.name）与/或设置配图（body.imageId，null 表示移除） */
export async function PUT(req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  const { name: rawName } = await params
  const name = safeDecode(rawName)
  try {
    const body = await req.json()
    const sql = getSql()
    await ensureSchema()

    const hasImage = "imageId" in body
    const imageId = hasImage && typeof body.imageId === "string" && body.imageId ? body.imageId : null
    const newName = typeof body?.name === "string" ? body.name.trim() : ""

    if (newName && newName !== name) {
      if (!newName) return NextResponse.json({ error: "分类名称不能为空" }, { status: 400 })
      if (newName.length > 20) return NextResponse.json({ error: "分类名称不能超过 20 个字符" }, { status: 400 })
      // 重命名：同步更新分类本身、配图键与引用它的文章
      const updated = await sql`
        UPDATE categories SET name = ${newName}
        WHERE name = ${name} AND NOT EXISTS (SELECT 1 FROM categories WHERE name = ${newName})
        RETURNING name
      `
      if (updated.length === 0) {
        return NextResponse.json({ error: "已存在同名分类" }, { status: 409 })
      }
      await sql`UPDATE posts SET category = ${newName} WHERE category = ${name}`
    }

    if (hasImage) {
      const current = newName && newName !== name ? newName : name
      await sql`UPDATE categories SET image_id = ${imageId} WHERE name = ${current}`
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("PUT /api/categories/[name]", err)
    return NextResponse.json({ error: "保存失败，请重试" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }
  const { name: rawName } = await params
  const name = safeDecode(rawName)
  try {
    const sql = getSql()
    await ensureSchema()
    await sql`DELETE FROM categories WHERE name = ${name}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /api/categories/[name]", err)
    return NextResponse.json({ error: "删除失败，请重试" }, { status: 500 })
  }
}
