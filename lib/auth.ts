// 鉴权：管理员密码登录，JWT 存 httpOnly cookie
import { createHash, timingSafeEqual } from "crypto"
import { SignJWT, jwtVerify } from "jose"

export const ADMIN_COOKIE = "admin_token"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 天

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) throw new Error("ADMIN_PASSWORD 未配置")
  return new TextEncoder().encode(`yanni-blog-auth:${secret}`)
}

export function hasAdminPassword(): boolean {
  return !!process.env.ADMIN_PASSWORD
}

/** 恒时比较密码，避免时序侧信道 */
export function checkPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false
  const a = createHash("sha256").update(input).digest()
  const b = createHash("sha256").update(password).digest()
  return timingSafeEqual(a, b)
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret())
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.role === "admin"
  } catch {
    return false
  }
}

/** 从请求 Cookie 中解析管理员身份（API 路由写操作用） */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const header = req.headers.get("cookie") ?? ""
  const pair = header
    .split(/;\s*/)
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
  if (!pair) return false
  let token = pair.slice(ADMIN_COOKIE.length + 1)
  try {
    token = decodeURIComponent(token)
  } catch {
    // 保留原值
  }
  return verifyAdminToken(token)
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
}
