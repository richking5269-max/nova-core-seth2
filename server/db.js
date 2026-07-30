let initialized = false;

export async function ensureDatabase(env) {
  if (initialized) return;
  await env.DB.batch([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS licenses (
        id TEXT PRIMARY KEY,
        account TEXT NOT NULL COLLATE NOCASE UNIQUE,
        note TEXT NOT NULL DEFAULT '',
        code_hash TEXT NOT NULL UNIQUE,
        code_last4 TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
        created_at TEXT NOT NULL,
        last_used_at TEXT,
        use_count INTEGER NOT NULL DEFAULT 0
      )`
    ),
    env.DB.prepare(
      "CREATE INDEX IF NOT EXISTS licenses_created_at_idx ON licenses(created_at DESC)"
    ),
    env.DB.prepare(
      "CREATE INDEX IF NOT EXISTS licenses_active_idx ON licenses(active)"
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS admin_login_attempts (
        ip_hash TEXT PRIMARY KEY,
        failures INTEGER NOT NULL DEFAULT 0,
        blocked_until INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )`
    )
  ]);
  initialized = true;
}
