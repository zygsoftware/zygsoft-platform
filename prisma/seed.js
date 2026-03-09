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

    // 3. Products
    const productsData = [
        {
            name: "Hukuk UDF Dönüştürücü",
            slug: "doc-to-udf",
            description: "DOCX dosyalarınızı UYAP uyumlu UDF formatına saniyeler içinde dönüştürün. KVKK uyumlu, toplu işlem destekli.",
            category: "hukuk",
            price: 499,
            iconType: "file-text",
            isActive: true,
        },
        {
            name: "PDF Birleştirici",
            slug: "pdf-merge",
            description: "Birden fazla PDF dosyasını tek bir çıktı halinde birleştiren hukuk odaklı yardımcı araç.",
            category: "hukuk",
            price: 199,
            iconType: "layers",
            isActive: true,
        },
        {
            name: "Kurumsal Otomasyon Paketi",
            slug: "enterprise-automation",
            description: "İş süreçlerinizi otomatikleştiren kurumsal yazılım paketi. Raporlama, bildirim ve entegrasyon dahil.",
            category: "web",
            price: 2499,
            iconType: "blocks",
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
    const udfProduct = await prisma.product.findUnique({ where: { slug: "doc-to-udf" } });
    const pdfProduct = await prisma.product.findUnique({ where: { slug: "pdf-merge" } });

    // 5. Subscriptions
    if (udfProduct && customer) {
        const existingSub = await prisma.subscription.findFirst({
            where: { userId: customer.id, productId: udfProduct.id },
        });
        if (!existingSub) {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            await prisma.subscription.create({
                data: {
                    userId: customer.id,
                    productId: udfProduct.id,
                    status: "active",
                    endsAt: endDate,
                },
            });
            console.log("✓ Abonelik oluşturuldu: Müşteri → UDF Dönüştürücü");
        }
    }

    // 6. Payments
    const paymentCount = await prisma.payment.count();
    if (paymentCount === 0 && customer && udfProduct) {
        await prisma.payment.create({
            data: {
                userId: customer.id,
                productId: udfProduct.id,
                amount: 499,
                status: "approved",
            },
        });
        await prisma.payment.create({
            data: {
                userId: customer.id,
                productId: udfProduct.id,
                amount: 499,
                status: "pending",
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
