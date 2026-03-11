const bcrypt = require("bcryptjs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 ZYGSOFT seed başlatılıyor...\n");

    // 1. Admin user
    let admin = await prisma.user.findUnique({ where: { email: "admin@zygsoft.com" } });
    if (!admin) {
        const hash = await bcrypt.hash("Zygsoft2024!", 12);
        admin = await prisma.user.create({
            data: {
                email: "admin@zygsoft.com",
                name: "Gürkan Yavuz",
                password: hash,
                role: "admin",
            },
        });
        console.log("✓ Admin kullanıcı oluşturuldu: admin@zygsoft.com / Zygsoft2024!");
    } else {
        console.log("✓ Admin kullanıcı zaten mevcut.");
    }

    // 2. Customer user
    let customer = await prisma.user.findUnique({ where: { email: "musteri@ornek.com" } });
    if (!customer) {
        const hash = await bcrypt.hash("Musteri123!", 12);
        customer = await prisma.user.create({
            data: {
                email: "musteri@ornek.com",
                name: "Ahmet Yılmaz",
                password: hash,
                role: "customer",
            },
        });
        console.log("✓ Müşteri kullanıcı oluşturuldu: musteri@ornek.com");
    } else {
        console.log("✓ Müşteri kullanıcı zaten mevcut.");
    }

    // 3. Products — only legal-toolkit (single subscription product)
    const productsData = [
        {
            name: "Hukuk Araçları Paketi",
            slug: "legal-toolkit",
            description: "UYAP ve belge iş akışları için geliştirilmiş profesyonel belge araçları paketi.",
            category: "legal",
            price: 3000,
            iconType: "file-text",
            isActive: true,
        },
    ];

    for (const p of productsData) {
        const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
        if (!existing) {
            await prisma.product.create({ data: p });
            console.log(`✓ Ürün eklendi: ${p.name}`);
        }
    }
    console.log("✓ Ürünler kontrol edildi.");

    // 4. Get product IDs for subscriptions and payments
    const legalProduct = await prisma.product.findUnique({ where: { slug: "legal-toolkit" } });

    // 5. Subscriptions
    if (legalProduct && customer) {
        const existingSub = await prisma.subscription.findFirst({
            where: { userId: customer.id, productId: legalProduct.id },
        });
        if (!existingSub) {
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            await prisma.subscription.create({
                data: {
                    userId: customer.id,
                    productId: legalProduct.id,
                    status: "active",
                    endsAt: endDate,
                },
            });
            console.log("✓ Abonelik oluşturuldu: Müşteri → Hukuk Araçları Paketi");
        }
    }

    // 6. Payments
    const paymentCount = await prisma.payment.count();
    if (paymentCount === 0 && customer && legalProduct) {
        await prisma.payment.create({
            data: {
                userId: customer.id,
                productId: legalProduct.id,
                amount: 3000,
                status: "approved",
            },
        });
        console.log("✓ Ödeme kayıtları eklendi.");
    } else {
        console.log("✓ Ödemeler zaten mevcut.");
    }

    // 7. Blog posts
    const blogPostsData = [
        {
            title: "Dijital Dönüşümde Hukuk Teknolojilerinin Rolü",
            slug: "dijital-donusumde-hukuk-teknolojileri",
            excerpt: "Hukuk büroları ve kurumlar için dijital dönüşüm sürecinde legal-tech çözümlerinin önemi.",
            content: "Dijital dönüşüm, hukuk sektöründe de kaçınılmaz hale geldi. UYAP entegrasyonu, belge otomasyonu ve iş akışı yönetimi artık modern hukuk bürolarının olmazsa olmazı. ZYGSOFT olarak Legal UDF Dönüştürücü ile bu sürece nasıl katkı sağladığımızı anlatıyoruz.",
            author: "Gürkan Yavuz",
            published: true,
        },
        {
            title: "Kurumsal Otomasyon: Nereden Başlamalı?",
            slug: "kurumsal-otomasyon-nereden-baslamali",
            excerpt: "İşletmelerin otomasyon yolculuğunda ilk adımlar ve öncelik belirleme.",
            content: "Otomasyon projelerinde başarı, doğru başlangıç noktası seçimine bağlıdır. Tekrarlayan işlerden başlayarak adım adım ilerlemek, hem ROI hem de ekip adaptasyonu açısından kritiktir.",
            author: "Gürkan Yavuz",
            published: true,
        },
        {
            title: "Belge Yönetimi ve KVKK Uyumluluğu",
            slug: "belge-yonetimi-kvkk-uyumluluk",
            excerpt: "Hassas belgelerin işlenmesinde KVKK uyumluluğu nasıl sağlanır?",
            content: "Hukuk büroları ve kurumlar, müşteri belgelerini işlerken KVKK gerekliliklerine uymak zorundadır. Sunucu tarafında geçici işleme, otomatik silme ve şifreleme gibi teknik önlemler bu süreçte hayati önem taşır.",
            author: "Gürkan Yavuz",
            published: true,
        },
    ];

    for (const post of blogPostsData) {
        const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
        if (!existing) {
            await prisma.blogPost.create({ data: post });
            console.log(`✓ Blog yazısı eklendi: ${post.title}`);
        }
    }
    console.log("✓ Blog yazıları kontrol edildi.");

    // 8. Projects (for portfolio)
    const projectsData = [
        {
            title: "Global Lojistik Hub",
            slug: "global-lojistik-hub",
            description: "Entegre lojistik yönetim platformu. Sipariş takibi, depo yönetimi ve raporlama.",
            client: "Lojistik A.Ş.",
        },
        {
            title: "AI Driven Analytics",
            slug: "ai-driven-analytics",
            description: "Yapay zeka destekli iş zekası ve raporlama sistemi.",
            client: "Finans Holding",
        },
    ];

    for (const proj of projectsData) {
        const existing = await prisma.project.findUnique({ where: { slug: proj.slug } });
        if (!existing) {
            await prisma.project.create({
                data: {
                    ...proj,
                    image: null,
                    link: null,
                },
            });
            console.log(`✓ Proje eklendi: ${proj.title}`);
        }
    }
    console.log("✓ Projeler kontrol edildi.");

    console.log("\n✅ Seed tamamlandı!");
    console.log("\nAdmin giriş: admin@zygsoft.com / Zygsoft2024!");
}

main()
    .catch((e) => {
        console.error("Seed hatası:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
