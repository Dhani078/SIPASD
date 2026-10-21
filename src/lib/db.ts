import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    const rawUrl = process.env.DATABASE_URL || 'mysql://2MyeDkP7MjFas9U.root:[REDACTED_DB_PASSWORD]@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sipasd';
    // Clean query parameters like ?sslaccept=strict to avoid mysql2 warnings
    const cleanUrl = rawUrl.split('?')[0];

    pool = mysql.createPool({
      uri: cleanUrl,
      ssl: {
        rejectUnauthorized: true,
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getDbPool();
  const [rows] = await p.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}
