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
  }
  return sqlInstance;
}

export interface StatementWrapper {
  get(...params: any[]): any;
  all(...params: any[]): any[];
  run(...params: any[]): { changes: number };
}

export interface DbWrapper {
  prepare(sql: string): StatementWrapper;
  exec(sql: string): void;
  close(): void;
}

export function getDbWrapper(rawDb: SqlJsDatabase): DbWrapper {
  return {
    prepare(sql: string): StatementWrapper {
      return {
        get(...params: any[]): any {
          const stmt = rawDb.prepare(sql);
          try {
            stmt.bind(params);
            if (stmt.step()) {
              const row = stmt.getAsObject();
              return row;
            }
            return undefined;
          } finally {
            stmt.free();
          }
        },
        all(...params: any[]): any[] {
          const stmt = rawDb.prepare(sql);
          const results: any[] = [];
          try {
            stmt.bind(params);
            while (stmt.step()) {
              results.push(stmt.getAsObject());
            }
            return results;
          } finally {
            stmt.free();
          }
        },
        run(...params: any[]): { changes: number } {
          rawDb.run(sql, params);
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

let dbWrapperInstance: DbWrapper | null = null;

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
