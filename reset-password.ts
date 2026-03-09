import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

// Force engine type to library
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

const prisma = new PrismaClient({});

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const user = await prisma.user.upsert({
        where: { email: "admin@zygsoft.com" },
        update: { password: hashedPassword },
        create: {
            email: "admin@zygsoft.com",
            password: hashedPassword,
            role: "admin"
        },
    });

    console.log("Admin password updated successfully for:", user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
