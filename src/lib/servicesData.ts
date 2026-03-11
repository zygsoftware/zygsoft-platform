export type ServiceFaq = { q: string; a: string };

export type ServiceLocaleData = {
    title: string;
    subtitle: string;
    content: string;
    features: string[];
    faq: ServiceFaq[];
};

export type ServiceData = {
    tr: ServiceLocaleData;
    en: ServiceLocaleData;
};

export const servicesData: Record<string, ServiceData> = {
    "web-ve-uygulama-gelistirme": {
        tr: {
            title: "Web ve Uygulama Geliştirme",
            subtitle: "İşletmeniz İçin Hızlı, Güvenli ve Ölçeklenebilir Dijital Çözümler",
            content: "Dijital dönüşüm yalnızca bir web sitesine sahip olmaktan ibaret değildir. ZYGSOFT olarak kurumsal web platformları, SaaS uygulamaları, özel yazılım sistemleri ve otomasyon altyapıları geliştiriyoruz. Next.js ve React tabanlı modern frontend mimarileri, güvenli ve ölçeklenebilir backend sistemleri ile işletmenizin dijital omurgasını sağlam temeller üzerine kuruyoruz. Her proje; performans, güvenlik ve kullanıcı deneyimi kriterlerini karşılayacak biçimde tasarlanır ve teslim edilir.",
            features: [
                "Kurumsal Web Sitesi ve SaaS Platform Geliştirme",
                "Özel Yazılım ve İş Süreci Otomasyon Sistemleri",
                "Modern UI/UX Tasarım ve Responsive Altyapı",
                "REST API Geliştirme ve Üçüncü Taraf Entegrasyonlar",
                "Yüksek Performans, SEO Optimizasyonu ve Core Web Vitals",
                "Anahtar Teslim Hosting, Domain ve Teknik Destek",
            ],
            faq: [
                {
                    q: "Hangi teknoloji yığınını kullanıyorsunuz?",
                    a: "Projelerimizde Next.js, React, TypeScript ve Node.js kullanıyoruz. Backend tarafında PostgreSQL, Prisma ve bulut altyapısını tercih ediyoruz. Proje gereksinimlerine göre farklı teknolojiler de değerlendirilebilir.",
                },
                {
                    q: "Proje ne kadar sürede tamamlanır?",
                    a: "Kurumsal web siteleri genellikle 2-4 hafta, kapsamlı web uygulamaları veya SaaS platformları ise 4-12 hafta arasında teslim edilmektedir. Kapsam netleştikten sonra gerçekçi bir zaman çizelgesi sunuyoruz.",
                },
                {
                    q: "Projem yayına geçtikten sonra destek alabilir miyim?",
                    a: "Evet. Tüm projelerimizde yayın sonrası teknik destek ve bakım hizmeti sunuyoruz. Uzun vadeli iş birliği için bakım paketlerimizden yararlanabilirsiniz.",
                },
            ],
        },
        en: {
            title: "Web and Application Development",
            subtitle: "Fast, Secure and Scalable Digital Solutions for Your Business",
            content: "Digital transformation goes far beyond having a website. At ZYGSOFT we build corporate web platforms, SaaS applications, custom software systems, and automation infrastructure. Using Next.js and React-based modern frontend architectures alongside secure and scalable backend systems, we lay a solid technical foundation for your business. Every project is designed and delivered to meet performance, security, and user experience standards.",
            features: [
                "Corporate Website and SaaS Platform Development",
                "Custom Software and Business Process Automation",
                "Modern UI/UX Design and Responsive Infrastructure",
                "REST API Development and Third-Party Integrations",
                "High Performance, SEO Optimisation and Core Web Vitals",
                "Turnkey Hosting, Domain and Technical Support",
            ],
            faq: [
                {
                    q: "What technology stack do you use?",
                    a: "We use Next.js, React, TypeScript and Node.js for our projects. On the backend we prefer PostgreSQL, Prisma and cloud infrastructure. Different technologies can be evaluated depending on project requirements.",
                },
                {
                    q: "How long does a project take to complete?",
                    a: "Corporate websites are typically delivered in 2-4 weeks, while comprehensive web applications or SaaS platforms take 4-12 weeks. We provide a realistic timeline once the scope is defined.",
                },
                {
                    q: "Can I get support after my project goes live?",
                    a: "Yes. We provide post-launch technical support and maintenance for all our projects. Long-term maintenance packages are available for ongoing collaboration.",
                },
            ],
        },
    },

    "sosyal-medya-yonetimi": {
        tr: {
            title: "Sosyal Medya Yönetimi",
            subtitle: "Stratejik ve Ölçülebilir Sosyal Medya Yaklaşımı",
            content: "Sosyal medyada tutarlı ve profesyonel bir varlık sürdürmek, güçlü bir marka kimliğinin temel unsurlarından biridir. ZYGSOFT olarak yalnızca içerik üretmiyoruz; platforma özel stratejiler, ölçülebilir kampanya hedefleri ve net raporlamalarla markanızın dijital büyümesini yönetiyoruz. Her platformun dinamiklerine uygun, veri odaklı ve performans temelli bir yaklaşım benimsiyoruz. İçerik takvimleri onayınızla oluşturulur, tüm görseller ve metinler marka tonunuza uygun hazırlanır.",
            features: [
                "Aylık İçerik Takvimi ve Onay Süreci",
                "Platforma Özel Strateji (Instagram, LinkedIn, TikTok vb.)",
                "Özgün Grafik Tasarım ve Video İçerik Üretimi",
                "Hedef Kitle Analizi ve Rakip İzleme",
                "Meta Ads ve Reklam Kampanyası Yönetimi",
                "Aylık Performans Raporu ve Büyüme Analizi",
            ],
            faq: [
                {
                    q: "Kaç platform için içerik üretiyorsunuz?",
                    a: "Paketimize göre Instagram, Facebook ve LinkedIn temel alınır. TikTok, X (Twitter) veya YouTube gibi ek platformlar için de içerik üretimi sağlanabilir.",
                },
                {
                    q: "Gönderilerin onay süreci nasıl işliyor?",
                    a: "Her ay için bir içerik takvimi hazırlanır ve paylaşımlar sizin onayınızdan geçtikten sonra planlanır. Revizyon talepleri 24 saat içinde karşılanır.",
                },
                {
                    q: "Reklam bütçesini siz mi yönetiyorsunuz?",
                    a: "Kampanya kurgusu, hedef kitle seçimi ve optimizasyon tarafımızca yürütülür; reklam harcaması doğrudan sizin Meta veya Google hesabınızdan yapılır. Şeffaf bir yapı sunuyoruz.",
                },
            ],
        },
        en: {
            title: "Social Media Management",
            subtitle: "Strategic and Measurable Social Media Approach",
            content: "Maintaining a consistent and professional presence on social media is one of the cornerstones of a strong brand identity. At ZYGSOFT we don't just produce content — we manage your brand's digital growth through platform-specific strategies, measurable campaign goals, and clear monthly reporting. We take a data-driven, performance-based approach tailored to each platform's dynamics. Content calendars are built with your approval and every visual and text is crafted to match your brand tone.",
            features: [
                "Monthly Content Calendar and Approval Workflow",
                "Platform-Specific Strategy (Instagram, LinkedIn, TikTok, etc.)",
                "Original Graphic Design and Video Content Production",
                "Target Audience Analysis and Competitor Monitoring",
                "Meta Ads and Paid Campaign Management",
                "Monthly Performance Report and Growth Analysis",
            ],
            faq: [
                {
                    q: "How many platforms do you produce content for?",
                    a: "Instagram, Facebook and LinkedIn are covered in the base package. Additional platforms such as TikTok, X (Twitter) or YouTube can also be included.",
                },
                {
                    q: "How does the post approval process work?",
                    a: "A content calendar is prepared each month and posts are scheduled only after your approval. Revision requests are handled within 24 hours.",
                },
                {
                    q: "Do you manage the advertising budget?",
                    a: "Campaign setup, audience targeting and optimisation are handled by us; the ad spend is paid directly from your own Meta or Google account, ensuring full transparency.",
                },
            ],
        },
    },

    "marka-kimligi-ve-grafik-tasarim": {
        tr: {
            title: "Marka Kimliği ve Grafik Tasarım",
            subtitle: "Unutulmaz Bir Marka Hikayesi ve Görsel Kimlik Tasarımı",
            content: "Güçlü bir marka kimliği, işletmenizi rakiplerinizden ayıran ve hedef kitlenizin güvenini kazanan en etkili araçlardan biridir. Logo tasarımından renk paletine, tipografi seçiminden brand guidelines belgesine kadar kurumsal kimliğinizin tüm bileşenlerini sistematik biçimde tasarlıyoruz. Dijital mecralarda, basılı materyallerde ve sosyal platformlarda tutarlı görünen bir marka sistemi, uzun vadede fark edilirliğinizi ve güvenilirliğinizi artırır.",
            features: [
                "Özgün Logo Tasarımı (3 Farklı Konsept)",
                "Kapsamlı Brand Guidelines (Marka Kullanım Kılavuzu)",
                "Kurumsal Renk Paleti ve Tipografi Sistemi",
                "Dijital Medya Şablonları (Sosyal Medya, Web)",
                "Basılı Materyal Tasarımı (Kartvizit, Broşür, Katalog)",
                "Vektörel ve Baskıya Hazır Dosya Teslimatı",
            ],
            faq: [
                {
                    q: "Logo tasarımında kaç konsept sunuyorsunuz?",
                    a: "Süreç 3 farklı konsept ile başlar. Seçilen konsept üzerinde sınırsız küçük revizyon hakkı sunuyoruz. Amacımız markaya gerçekten yakışan bir sonuç ortaya çıkarmaktır.",
                },
                {
                    q: "Teslim dosyalarında hangi formatlar yer alıyor?",
                    a: "Baskıya hazır PDF, vektörel (AI, EPS, SVG) ve dijital kullanım için PNG/JPG formatlarında teslimat yapıyoruz. Brand guidelines belgesi ise ayrıca PDF olarak sunulur.",
                },
                {
                    q: "Yalnızca logo mu tasarlıyorsunuz?",
                    a: "Logo tek başına da tasarlanabilir; ancak bütünlüklü bir marka algısı için kurumsal kimlik paketini tercih etmenizi öneririz. Uzun vadede daha güçlü ve tutarlı bir marka inşa edilmiş olur.",
                },
            ],
        },
        en: {
            title: "Brand Identity and Graphic Design",
            subtitle: "An Unforgettable Brand Story and Visual Identity Design",
            content: "A strong brand identity is one of the most effective tools for distinguishing your business and earning the trust of your target audience. We systematically design every component of your corporate identity — from logo and colour palette to typography and brand guidelines. A brand system that appears consistent across digital channels, print materials and social platforms builds long-term recognition and credibility.",
            features: [
                "Original Logo Design (3 Concept Proposals)",
                "Comprehensive Brand Guidelines Document",
                "Corporate Colour Palette and Typography System",
                "Digital Media Templates (Social Media, Web)",
                "Print Material Design (Business Cards, Brochures, Catalogues)",
                "Vector and Print-Ready File Delivery",
            ],
            faq: [
                {
                    q: "How many concepts do you present for logo design?",
                    a: "The process starts with 3 different concepts. Unlimited minor revisions are offered on the selected concept. Our goal is to arrive at a result that genuinely suits the brand.",
                },
                {
                    q: "What file formats are included in the delivery?",
                    a: "We deliver print-ready PDF, vector files (AI, EPS, SVG), and PNG/JPG for digital use. The brand guidelines document is also provided as a separate PDF.",
                },
                {
                    q: "Can you design only a logo?",
                    a: "A standalone logo is possible; however, we recommend the full corporate identity package for a cohesive brand perception. It leads to a stronger, more consistent brand in the long run.",
                },
            ],
        },
    },

    "dijital-strateji-ve-pazarlama": {
        tr: {
            title: "Dijital Strateji ve Pazarlama",
            subtitle: "Veri Odaklı Dijital Büyüme ve Performans Pazarlaması",
            content: "İyi bir ürün veya hizmet tek başına yeterli değildir; doğru kişilere ulaşmak için somut bir dijital strateji gerekir. ZYGSOFT olarak işletmenizin büyüme hedeflerini anlayarak bütünleşik bir dijital pazarlama planı oluşturuyoruz. SEO ile organik görünürlüğünüzü artırıyor, Google Ads ve Meta Ads ile hedef kitleye doğrudan ulaşıyor, dönüşüm oranı optimizasyonuyla reklam bütçenizin getirisini maksimize ediyoruz. Tüm süreç düzenli raporlar ve şeffaf analizlerle izlenebilir hale gelir.",
            features: [
                "Teknik SEO ve Anahtar Kelime Stratejisi",
                "Google Ads Kampanya Kurulumu ve Optimizasyonu",
                "Meta (Facebook/Instagram) ve TikTok Reklam Yönetimi",
                "Dönüşüm Oranı Optimizasyonu (CRO)",
                "Google Analytics ve Veri Odaklı Karar Analizi",
                "Aylık Performans Raporu ve Strateji Güncellemesi",
            ],
            faq: [
                {
                    q: "Sonuçları ne zaman görmeye başlarım?",
                    a: "SEO çalışmalarında organik sonuçlar genellikle 2-3 ay içinde belirginleşir. Ücretli reklamcılıkta kampanya yayına girdikten sonraki ilk hafta içinde trafik ve dönüşüm verilerine ulaşabilirsiniz.",
                },
                {
                    q: "Minimum reklam bütçesi nedir?",
                    a: "Reklam harcaması doğrudan platform hesabınıza yatırılır. Sektöre ve hedefe bağlı olarak önerilen minimum bütçeyi ilk görüşmede netleştiriyoruz; genellikle aylık 3.000 TL ve üzeri bütçelerle anlamlı sonuçlar elde edilmektedir.",
                },
                {
                    q: "SEO ile reklam arasında ne tercih etmeliyim?",
                    a: "Bu iki kanal birbirini tamamlar. Kısa vadede hızlı görünürlük için ücretli reklamlar, uzun vadede sürdürülebilir organik büyüme için SEO kullanılır. Hedeflerinize göre bütünleşik bir strateji öneriyoruz.",
                },
            ],
        },
        en: {
            title: "Digital Strategy and Marketing",
            subtitle: "Data-Driven Digital Growth and Performance Marketing",
            content: "A great product or service is not enough on its own — you need a concrete digital strategy to reach the right people. At ZYGSOFT we build an integrated digital marketing plan by understanding your business growth objectives. We grow your organic visibility through SEO, reach your target audience directly with Google Ads and Meta Ads, and maximise the return on your ad budget through conversion rate optimisation. The entire process is made transparent through regular reports and clear analysis.",
            features: [
                "Technical SEO and Keyword Strategy",
                "Google Ads Campaign Setup and Optimisation",
                "Meta (Facebook/Instagram) and TikTok Ad Management",
                "Conversion Rate Optimisation (CRO)",
                "Google Analytics and Data-Driven Decision Analysis",
                "Monthly Performance Report and Strategy Updates",
            ],
            faq: [
                {
                    q: "When will I start seeing results?",
                    a: "Organic SEO results typically become noticeable within 2-3 months. With paid advertising, you can access traffic and conversion data within the first week of a campaign going live.",
                },
                {
                    q: "What is the minimum advertising budget?",
                    a: "Ad spend is paid directly to the platform account. We clarify recommended minimum budgets during the first consultation based on your industry and goals.",
                },
                {
                    q: "Should I choose SEO or paid ads?",
                    a: "These two channels complement each other. Paid ads deliver fast visibility in the short term, while SEO drives sustainable organic growth over the long term. We recommend an integrated strategy based on your goals.",
                },
            ],
        },
    },

    "hedef-kitle-analizi": {
        tr: {
            title: "Hedef Kitle Analizi",
            subtitle: "Müşterilerinizi Yakından Tanıyın ve Satışlarınızı Artırın",
            content: "Etkili bir dijital strateji, doğru kitleyi doğru zamanda doğru mesajla hedeflemekle başlar. ZYGSOFT olarak işletmenizin mevcut ve potansiyel müşteri profilini demografik, psikografik ve davranışsal verilerle derinlemesine analiz ediyoruz. Bu analizlerin sonuçları; reklam harcamalarınızı optimize etmek, içerik stratejinizi netleştirmek ve satış döngünüzü kısaltmak için somut bir yol haritasına dönüştürülür.",
            features: [
                "Demografik ve Psikografik Segmentasyon",
                "Müşteri Satın Alma Yolculuğu (Customer Journey) Haritalaması",
                "Rakip Hedef Kitle Karşılaştırma Analizi",
                "Pazar Büyüklüğü ve Potansiyel Araştırması",
                "Persona Profili Oluşturma ve Dokümentasyon",
                "Veri Odaklı Mesaj Stratejisi ve İletişim Planı",
            ],
            faq: [
                {
                    q: "Hedef kitle analizi ne işe yarar?",
                    a: "Doğru kitleyi tanımlamak, reklam bütçesinin boşa gitmesini önler ve mesajınızın en çok dönüşüm sağlayacak kişilere ulaşmasını sağlar. Analizlerimiz hem dijital reklamcılık hem de içerik stratejisi için somut veriler sunar.",
                },
                {
                    q: "Bu hizmet hangi sektörlere uygundur?",
                    a: "E-ticaret, hukuk, sağlık, eğitim, teknoloji, inşaat ve daha pek çok sektörde uygulanmıştır. Sektörünüze özgü veriler ve metodoloji kullanıyoruz.",
                },
                {
                    q: "Analiz çıktısı ne zaman teslim edilir?",
                    a: "Proje kapsamına bağlı olarak 5-10 iş günü içinde kapsamlı bir analiz raporu ve aksiyon planı sunulmaktadır.",
                },
            ],
        },
        en: {
            title: "Target Audience Analysis",
            subtitle: "Know Your Customers Closely and Increase Your Sales",
            content: "An effective digital strategy starts with targeting the right audience with the right message at the right time. At ZYGSOFT we conduct in-depth analysis of your existing and potential customer profile using demographic, psychographic, and behavioural data. The findings are converted into a concrete roadmap to optimise your ad spend, sharpen your content strategy, and shorten your sales cycle.",
            features: [
                "Demographic and Psychographic Segmentation",
                "Customer Journey Mapping",
                "Competitor Audience Benchmarking",
                "Market Size and Opportunity Research",
                "Persona Profile Creation and Documentation",
                "Data-Driven Messaging Strategy and Communication Plan",
            ],
            faq: [
                {
                    q: "What is target audience analysis useful for?",
                    a: "Identifying the right audience prevents ad budget waste and ensures your message reaches the people most likely to convert. Our analyses provide actionable data for both digital advertising and content strategy.",
                },
                {
                    q: "Which industries is this service suitable for?",
                    a: "It has been applied in e-commerce, legal, healthcare, education, technology, real estate and many other sectors. We use industry-specific data and methodology.",
                },
                {
                    q: "When is the analysis delivered?",
                    a: "Depending on project scope, a comprehensive analysis report and action plan is delivered within 5-10 business days.",
                },
            ],
        },
    },
};
