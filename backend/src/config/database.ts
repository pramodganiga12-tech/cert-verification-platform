import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

let sqlInstance: SqlJsDatabase | null = null;

export function getDbPath(): string {
  const envPath = process.env.DATABASE_PATH;
  if (envPath) {
    return path.isAbsolute(envPath)
      ? envPath
      : path.resolve(__dirname, '../../../', envPath);
  }
  return path.resolve(__dirname, '../../../database/platform.sqlite');
}

export function saveDb(): void {
  if (sqlInstance) {
    const data = sqlInstance.export();
    const buffer = Buffer.from(data);
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, buffer);
  }
}

export async function initDatabaseInstance(): Promise<SqlJsDatabase> {
  if (!sqlInstance) {
    const SQL = await initSqlJs();
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      sqlInstance = new SQL.Database(fileBuffer);
    } else {
      sqlInstance = new SQL.Database();
    }

    const { runMigrationsAndSeeds } = await import('./seed.js');
    await runMigrationsAndSeeds(sqlInstance);
  }
  return sqlInstance;
}

export interface StatementWrapper {
  get<T = Record<string, unknown>>(...params: unknown[]): T | undefined;
  all<T = Record<string, unknown>>(...params: unknown[]): T[];
  run(...params: unknown[]): { changes: number };
}

export interface DbWrapper {
  prepare(sql: string): StatementWrapper;
  exec(sql: string): void;
  close(): void;
}

export function getDbWrapper(rawDb: SqlJsDatabase): DbWrapper {
  const sanitizeParams = (params: unknown[]) => params.map((p) => (p === undefined ? null : p));

  return {
    prepare(sql: string): StatementWrapper {
      return {
        get<T = Record<string, unknown>>(...params: unknown[]): T | undefined {
          const stmt = rawDb.prepare(sql);
          try {
            stmt.bind(sanitizeParams(params) as (string | number | null | Uint8Array)[]);
            if (stmt.step()) {
              const row = stmt.getAsObject();
              return row as unknown as T;
            }
            return undefined;
          } finally {
            stmt.free();
          }
        },
        all<T = Record<string, unknown>>(...params: unknown[]): T[] {
          const stmt = rawDb.prepare(sql);
          const results: T[] = [];
          try {
            stmt.bind(sanitizeParams(params) as (string | number | null | Uint8Array)[]);
            while (stmt.step()) {
              results.push(stmt.getAsObject() as unknown as T);
            }
            return results;
          } finally {
            stmt.free();
          }
        },
        run(...params: unknown[]): { changes: number } {
          const clean = sanitizeParams(params) as (string | number | null | Uint8Array)[];
          rawDb.run(sql, clean);
          const changes = rawDb.getRowsModified();
          saveDb();
          return { changes };
        }
      };
    },
    exec(sql: string): void {
      rawDb.exec(sql);
      saveDb();
    },
    close(): void {
      saveDb();
      sqlInstance = null;
    }
  };
}

export async function getDb(): Promise<DbWrapper> {
  const rawDb = await initDatabaseInstance();
  return getDbWrapper(rawDb);
}

export function closeDb(): void {
  if (sqlInstance) {
    saveDb();
    sqlInstance.close();
    sqlInstance = null;
  }
}
