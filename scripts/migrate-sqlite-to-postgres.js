#!/usr/bin/env node

require("dotenv/config");

const path = require("path");
const Database = require("better-sqlite3");
const { Client } = require("pg");

const SQLITE_DATABASE_PATH = process.env.SQLITE_DATABASE_PATH || path.resolve(process.cwd(), "dev.db");
const DATABASE_URL = process.env.DATABASE_URL;
const APPEND_MODE = process.argv.includes("--append");

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
}

const TABLE_ORDER = [
    "ApiConnection",
    "project_categories",
    "projects",
    "User",
    "Product",
    "Account",
    "Session",
    "VerificationToken",
    "EmailVerificationToken",
    "PasswordResetToken",
    "Payment",
    "Subscription",
    "TrialStartEvent",
    "ToolUsage",
    "UserLetterhead",
    "blog_categories",
    "blog_tags",
    "blog_posts",
    "blog_post_tags",
    "blog_comments",
    "blog_likes",
    "SupportTicket",
    "ContactMessage",
];

function quoteIdent(value) {
    return `"${String(value).replace(/"/g, "\"\"")}"`;
}

function coerceValue(column, value) {
    if (value === null || value === undefined) return null;

    const type = String(column.type || "").toUpperCase();
    if (type.includes("BOOLEAN")) {
        return Boolean(value);
    }

    return value;
}

async function truncateTables(client) {
    const quoted = TABLE_ORDER.map(quoteIdent).join(", ");
    await client.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}

async function migrateTable(sqliteDb, pgClient, tableName) {
    const columns = sqliteDb.prepare(`PRAGMA table_info(${quoteIdent(tableName)})`).all();
    if (columns.length === 0) {
        console.log(`- ${tableName}: skipped (table not found in SQLite)`);
        return;
    }

    const rows = sqliteDb.prepare(`SELECT * FROM ${quoteIdent(tableName)}`).all();
    if (rows.length === 0) {
        console.log(`- ${tableName}: 0 rows`);
        return;
    }

    const columnNames = columns.map((col) => col.name);
    const quotedColumns = columnNames.map(quoteIdent).join(", ");
    const placeholderList = columnNames.map((_, index) => `$${index + 1}`).join(", ");

    for (const row of rows) {
        const values = columns.map((column) => coerceValue(column, row[column.name]));
        await pgClient.query(
            `INSERT INTO ${quoteIdent(tableName)} (${quotedColumns}) VALUES (${placeholderList})`,
            values,
        );
    }

    console.log(`- ${tableName}: migrated ${rows.length} rows`);
}

async function main() {
    const sqliteDb = new Database(SQLITE_DATABASE_PATH, { readonly: true });
    const pgClient = new Client({ connectionString: DATABASE_URL });

    await pgClient.connect();

    try {
        if (!APPEND_MODE) {
            console.log("Resetting Postgres tables before import...");
            await truncateTables(pgClient);
        } else {
            console.log("Append mode enabled: existing Postgres rows will be preserved.");
        }

        await pgClient.query("BEGIN");
        for (const tableName of TABLE_ORDER) {
            await migrateTable(sqliteDb, pgClient, tableName);
        }
        await pgClient.query("COMMIT");
        console.log("\nSQLite -> Postgres migration completed.");
    } catch (error) {
        await pgClient.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        sqliteDb.close();
        await pgClient.end();
    }
}

main().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});
