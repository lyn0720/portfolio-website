// 查询登录状态
import { NextResponse } from "next/server"
import { ADMIN_COOKIE, hasAdminPassword, verifyAdminToken } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const header = req.headers.get("cookie") ?? ""
  const pair = header.split(/;\s*/).find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
  let token: string | undefined
  if (pair) {
    token = pair.slice(ADMIN_COOKIE.length + 1)
    try {
      token = decodeURIComponent(token)
    } catch {
      // 保留原值
    }
  }
  const isAdmin = hasAdminPassword() && (await verifyAdminToken(token))
  return NextResponse.json({ isAdmin })
}
