import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const cleanUrl = rawUrl.split('?')[0];

    pool = mysql.createPool({
      uri: cleanUrl,
      ssl: {
        rejectUnauthorized: true,
      },
      dateStrings: ['DATE'],
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

const TRANSIENT_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'EPIPE']);

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getDbPool();
  try {
    const [rows] = await p.execute(sql, params);
    return rows as T[];
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (TRANSIENT_CODES.has(code)) {
      const [rows] = await p.execute(sql, params);
      return rows as T[];
    }
    throw err;
  }
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
