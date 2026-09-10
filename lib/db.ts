// 数据库：Postgres（Neon）连接 + 幂等建表
import postgres from "postgres"

let client: postgres.Sql | null = null
let schemaPromise: Promise<void> | null = null

export function getSql(): postgres.Sql {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 未配置")
  }
  if (!client) {
    // serverless 环境下连接复用受限，max 保持 1
    client = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 20 })
  }
  return client
}

/** 幂等建表，进程内只执行一次 */
export function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS categories (
          name TEXT PRIMARY KEY,
          image_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          cover_id TEXT,
          video_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS media (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          kind TEXT NOT NULL,
          mime TEXT NOT NULL,
          size BIGINT NOT NULL DEFAULT 0,
          url TEXT NOT NULL,
          thumb TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          content TEXT NOT NULL,
          date TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `
    })().catch((err) => {
      schemaPromise = null
      throw err
    })
  }
  return schemaPromise
}
