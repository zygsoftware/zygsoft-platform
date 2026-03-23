#!/usr/bin/env node

require("dotenv/config");

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const BUCKETS = {
    blog: process.env.SUPABASE_STORAGE_BLOG_BUCKET || "blog-images",
    projects: process.env.SUPABASE_STORAGE_PROJECT_BUCKET || "project-images",
    letterheads: process.env.SUPABASE_STORAGE_LETTERHEAD_BUCKET || "letterheads",
};

function detectContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".udf": "application/octet-stream",
        ".xml": "application/xml",
        ".pdf": "application/pdf",
    };
    return map[ext] || "application/octet-stream";
}

function encodeObjectPath(objectPath) {
    return objectPath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
}

function publicUrl(bucket, objectPath) {
    return `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodeObjectPath(objectPath)}`;
}

async function uploadFile(bucket, objectPath, localPath) {
    const bytes = fs.readFileSync(localPath);
    const response = await fetch(
        `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/${bucket}/${encodeObjectPath(objectPath)}`,
        {
            method: "POST",
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": detectContentType(localPath),
                "x-upsert": "true",
            },
            body: new Blob([bytes]),
        },
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Upload failed for ${localPath}: ${response.status} ${message}`);
    }

    return publicUrl(bucket, objectPath);
}

async function migrateBlogUploads(pgClient) {
    const blogDir = path.join(process.cwd(), "public", "uploads", "blog");
    if (!fs.existsSync(blogDir)) {
        console.log("- blog uploads: none found");
        return;
    }

    const files = fs.readdirSync(blogDir).filter((name) => fs.statSync(path.join(blogDir, name)).isFile());
    for (const fileName of files) {
        const localPath = path.join(blogDir, fileName);
        const oldPath = `/uploads/blog/${fileName}`;
        const objectPath = `blog/${fileName}`;
        const url = await uploadFile(BUCKETS.blog, objectPath, localPath);

        await pgClient.query(
            `
            UPDATE blog_posts
            SET
                "coverImage" = CASE WHEN "coverImage" = $1 THEN $2 ELSE "coverImage" END,
                "ogImage" = CASE WHEN "ogImage" = $1 THEN $2 ELSE "ogImage" END,
                "contentTr" = REPLACE(COALESCE("contentTr", ''), $1, $2),
                "contentEn" = REPLACE(COALESCE("contentEn", ''), $1, $2)
            WHERE
                "coverImage" = $1 OR "ogImage" = $1 OR POSITION($1 IN COALESCE("contentTr", '')) > 0 OR POSITION($1 IN COALESCE("contentEn", '')) > 0
            `,
            [oldPath, url],
        );

        console.log(`- blog upload migrated: ${fileName}`);
    }
}

async function migrateProjectUploads(pgClient) {
    const projectDir = path.join(process.cwd(), "public", "uploads", "projects");
    if (!fs.existsSync(projectDir)) {
        console.log("- project uploads: none found");
        return;
    }

    const files = fs.readdirSync(projectDir).filter((name) => fs.statSync(path.join(projectDir, name)).isFile());
    for (const fileName of files) {
        const localPath = path.join(projectDir, fileName);
        const oldPath = `/uploads/projects/${fileName}`;
        const objectPath = `projects/${fileName}`;
        const url = await uploadFile(BUCKETS.projects, objectPath, localPath);

        await pgClient.query(
            `
            UPDATE projects
            SET
                "coverImage" = CASE WHEN "coverImage" = $1 THEN $2 ELSE "coverImage" END,
                "ogImage" = CASE WHEN "ogImage" = $1 THEN $2 ELSE "ogImage" END
            WHERE "coverImage" = $1 OR "ogImage" = $1
            `,
            [oldPath, url],
        );

        console.log(`- project upload migrated: ${fileName}`);
    }
}

async function migrateLetterheads(pgClient) {
    const letterheadRoot = path.join(process.cwd(), "uploads", "letterheads");
    if (!fs.existsSync(letterheadRoot)) {
        console.log("- letterheads: none found");
        return;
    }

    const userIds = fs.readdirSync(letterheadRoot).filter((name) => fs.statSync(path.join(letterheadRoot, name)).isDirectory());
    for (const userId of userIds) {
        const userDir = path.join(letterheadRoot, userId);
        const files = fs.readdirSync(userDir).filter((name) => fs.statSync(path.join(userDir, name)).isFile());

        for (const fileName of files) {
            const localPath = path.join(userDir, fileName);
            const objectPath = `${userId}/${fileName}`;
            await uploadFile(BUCKETS.letterheads, objectPath, localPath);

            await pgClient.query(
                `
                INSERT INTO "UserLetterhead" ("id", "userId", "filePath", "createdAt")
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT ("userId")
                DO UPDATE SET "filePath" = EXCLUDED."filePath"
                `,
                [crypto.randomUUID(), userId, objectPath],
            );

            console.log(`- letterhead migrated: ${userId}/${fileName}`);
        }
    }
}

async function main() {
    const pgClient = new Client({ connectionString: DATABASE_URL });
    await pgClient.connect();

    try {
        await migrateBlogUploads(pgClient);
        await migrateProjectUploads(pgClient);
        await migrateLetterheads(pgClient);
        console.log("\nLocal uploads -> Supabase Storage migration completed.");
    } finally {
        await pgClient.end();
    }
}

main().catch((error) => {
    console.error("Storage migration failed:", error);
    process.exit(1);
});
