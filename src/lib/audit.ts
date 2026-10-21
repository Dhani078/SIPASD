import { query } from './db';

export async function logAudit(
  action: string,
  resource: string,
  resourceId?: string | null,
  userId?: string | null,
  ipAddress: string = '127.0.0.1',
  userAgent: string = 'Web Browser',
  details?: any
) {
  try {
    const detailsJson = details ? JSON.stringify(details) : null;
    await query(
      `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, action, resource, resourceId || null, ipAddress, userAgent, detailsJson]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
