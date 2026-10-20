import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: connectionString.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const result = await currentPool.query<T>(text, params);
  return result.rows;
}
