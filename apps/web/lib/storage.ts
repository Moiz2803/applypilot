export interface KVStore<T> {
  get: (key: string) => T | null;
  set: (key: string, value: T) => void;
}

export class LocalJsonStore<T> implements KVStore<T> {
  private data = new Map<string, T>();

  get(key: string): T | null {
    return this.data.get(key) ?? null;
  }

  set(key: string, value: T): void {
    this.data.set(key, value);
  }
}

export function createOptionalSQLiteStore<T>(): KVStore<T> {
  const req = (global as unknown as { require?: NodeRequire }).require;

  if (!req) {
    throw new Error('SQLite adapter is only available in Node.js runtime.');
  }

  try {
    const BetterSqlite3 = req('better-sqlite3');
    const db = new BetterSqlite3('visa-ats.db');
    db.exec('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)');

    return {
      get: (key) => {
        const row = db.prepare('SELECT value FROM kv WHERE key = ?').get(key) as
          | { value: string }
          | undefined;
        return row ? (JSON.parse(row.value) as T) : null;
      },
      set: (key, value) => {
        db.prepare('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
      },
    };
  } catch {
    throw new Error('Install optional dependency better-sqlite3 to enable SQLite persistence.');
  }
}
