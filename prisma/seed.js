const bcrypt = require("bcryptjs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 ZYGSOFT seed başlatılıyor...\n");

    // 1. Admin user — use env vars if set, else defaults
    const adminEmail = process.env.ADMIN_EMAIL?.trim() || "admin@zygsoft.com";
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || "Zygsoft2024!";
    const adminName = process.env.ADMIN_NAME?.trim() || "Gürkan Yavuz";

    let admin = await prisma.user.findFirst({ where: { role: "admin" } });
    if (!admin) {
        const existingByEmail = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (existingByEmail && existingByEmail.role !== "admin") {
            console.log("⚠ E-posta zaten müşteri olarak kayıtlı:", adminEmail, "- admin atlanıyor.");
        } else if (!existingByEmail) {
            const hash = await bcrypt.hash(adminPassword, 12);
            admin = await prisma.user.create({
                data: {
                    email: adminEmail,
                    name: adminName,
                    password: hash,
                    role: "admin",
                },
            });
            console.log("✓ Admin kullanıcı oluşturuldu:", adminEmail, "/ (şifre env'den veya varsayılan)");
        }
    }
    if (admin) {
        console.log("✓ Admin kullanıcı hazır:", admin.email);
    } else {
        console.log("✓ Admin kullanıcı zaten mevcut veya atlandı.");
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

    // 7. Blog categories
    const blogCategoriesData = [
        { name_tr: "Hukuk Teknolojileri", name_en: "Legal Tech", slug: "hukuk-teknolojileri" },
        { name_tr: "Dijital Dönüşüm", name_en: "Digital Transformation", slug: "dijital-donusum" },
        { name_tr: "Yazılım", name_en: "Software", slug: "yazilim" },
    ];
    const categoryIds = {};
    for (const c of blogCategoriesData) {
        let cat = await prisma.blogCategory.findUnique({ where: { slug: c.slug } });
        if (!cat) {
            cat = await prisma.blogCategory.create({ data: c });
            console.log(`✓ Blog kategorisi eklendi: ${c.name_tr}`);
        }
        categoryIds[c.slug] = cat.id;
    }
    console.log("✓ Blog kategorileri kontrol edildi.");

    // 8. Blog posts (new schema)
    const blogPostsData = [
        {
            slug: "dijital-donusumde-hukuk-teknolojileri",
            title_tr: "Dijital Dönüşümde Hukuk Teknolojilerinin Rolü",
            title_en: "The Role of Legal Tech in Digital Transformation",
            excerpt_tr: "Hukuk büroları ve kurumlar için dijital dönüşüm sürecinde legal-tech çözümlerinin önemi.",
            excerpt_en: "The importance of legal-tech solutions for law firms and institutions in the digital transformation process.",
            content_tr: "<p>Dijital dönüşüm, hukuk sektöründe de kaçınılmaz hale geldi. UYAP entegrasyonu, belge otomasyonu ve iş akışı yönetimi artık modern hukuk bürolarının olmazsa olmazı. ZYGSOFT olarak Legal UDF Dönüştürücü ile bu sürece nasıl katkı sağladığımızı anlatıyoruz.</p>",
            content_en: "<p>Digital transformation has become inevitable in the legal sector too. UYAP integration, document automation and workflow management are now essential for modern law firms. We explain how ZYGSOFT contributes to this process with the Legal UDF Converter.</p>",
            category_id: categoryIds["hukuk-teknolojileri"],
            is_featured: true,
            published: true,
            published_at: new Date(),
            reading_time_min: 3,
        },
        {
            slug: "kurumsal-otomasyon-nereden-baslamali",
            title_tr: "Kurumsal Otomasyon: Nereden Başlamalı?",
            title_en: "Corporate Automation: Where to Start?",
            excerpt_tr: "İşletmelerin otomasyon yolculuğunda ilk adımlar ve öncelik belirleme.",
            excerpt_en: "First steps and priority setting in the automation journey of businesses.",
            content_tr: "<p>Otomasyon projelerinde başarı, doğru başlangıç noktası seçimine bağlıdır. Tekrarlayan işlerden başlayarak adım adım ilerlemek, hem ROI hem de ekip adaptasyonu açısından kritiktir.</p>",
            content_en: "<p>Success in automation projects depends on choosing the right starting point. Starting with repetitive tasks and progressing step by step is critical for both ROI and team adaptation.</p>",
            category_id: categoryIds["dijital-donusum"],
            is_featured: false,
            published: true,
            published_at: new Date(),
            reading_time_min: 2,
        },
        {
            slug: "belge-yonetimi-kvkk-uyumluluk",
            title_tr: "Belge Yönetimi ve KVKK Uyumluluğu",
            title_en: "Document Management and KVKK Compliance",
            excerpt_tr: "Hassas belgelerin işlenmesinde KVKK uyumluluğu nasıl sağlanır?",
            excerpt_en: "How to ensure KVKK compliance when processing sensitive documents?",
            content_tr: "<p>Hukuk büroları ve kurumlar, müşteri belgelerini işlerken KVKK gerekliliklerine uymak zorundadır. Sunucu tarafında geçici işleme, otomatik silme ve şifreleme gibi teknik önlemler bu süreçte hayati önem taşır.</p>",
            content_en: "<p>Law firms and institutions must comply with KVKK requirements when processing client documents. Technical measures such as temporary processing on the server, automatic deletion and encryption are vital in this process.</p>",
            category_id: categoryIds["hukuk-teknolojileri"],
            is_featured: false,
            published: true,
            published_at: new Date(),
            reading_time_min: 2,
        },
    ];

    for (const post of blogPostsData) {
        const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
        if (!existing) {
            await prisma.blogPost.create({ data: post });
            console.log(`✓ Blog yazısı eklendi: ${post.title_tr}`);
        }
    }
    console.log("✓ Blog yazıları kontrol edildi.");

    // 9. Projects (for portfolio)
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
    console.log("\nAdmin giriş:", adminEmail, "— şifre .env'de veya varsayılan: Zygsoft2024!");
}

main()
    .catch((e) => {
        console.error("Seed hatası:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
