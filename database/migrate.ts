import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

async function runMigration() {
  const dbPath = process.env.DATABASE_PATH
    ? (path.isAbsolute(process.env.DATABASE_PATH)
        ? process.env.DATABASE_PATH
        : path.resolve(__dirname, '../', process.env.DATABASE_PATH))
    : path.resolve(__dirname, './platform.sqlite');

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`[Database Migration] Initializing SQLite (sql.js) database at: ${dbPath}`);
  const SQL = await initSqlJs();
  let db: InstanceType<typeof SQL.Database>;

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  const schemaPath = path.resolve(__dirname, './schema.sql');
  console.log(`[Database Migration] Reading schema definition from: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  db.exec(schemaSql);

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log('[Database Migration] All 15 core tables and indexes migrated successfully.');
  db.close();
}

runMigration().catch(err => {
  console.error('[Database Migration Error]:', err);
  process.exit(1);
});
