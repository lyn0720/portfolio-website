// 管理员登录：密码校验通过后签发 JWT 存入 httpOnly cookie
import { NextResponse } from "next/server"
import { ADMIN_COOKIE, adminCookieOptions, checkPassword, createAdminToken, hasAdminPassword } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  let password = ""
  try {
    const body = await req.json()
    if (typeof body?.password === "string") password = body.password
  } catch {
    // 忽略解析失败
  }

  if (!hasAdminPassword()) {
    return NextResponse.json({ error: "服务端未配置 ADMIN_PASSWORD" }, { status: 500 })
  }
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "密码不正确" }, { status: 401 })
  }

  const token = await createAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions)
  return res
}
