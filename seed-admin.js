const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

// PrismaClient picks up DATABASE_URL from env automatically
const prisma = new PrismaClient();

async function main() {
    const email = "admin@zygsoft.com";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log("✓ Admin user already exists:", email);
        return;
    }

    const hash = await bcrypt.hash("Zygsoft2024!", 12);
    const user = await prisma.user.create({
        data: {
            email,
            password: hash,
            role: "admin",
        },
    });
    console.log("✓ Admin user created successfully!");
    console.log("  Email:    admin@zygsoft.com");
    console.log("  Password: Zygsoft2024!");
    console.log("  Role:     admin");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
