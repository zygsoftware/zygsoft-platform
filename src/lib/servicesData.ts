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
            subtitle: "Kurumsal web siteleri, paneller ve özel ürün akışları için hızlı, güvenli ve ölçeklenebilir yazılım geliştirme hizmeti",
            content: "ZYGSOFT olarak yalnızca bir arayüz tasarlamıyor, işletmenizin dijital omurgasını kuruyoruz. Kurumsal web siteleri, müşteri panelleri, SaaS ürünleri, üyelik sistemleri, belge akışları ve özel operasyon araçları geliştirirken performans, sürdürülebilirlik ve satış akışını birlikte ele alıyoruz. Next.js, React, TypeScript ve modern backend mimarileri ile hem hızlı çalışan hem de büyümeye uygun sistemler kuruyoruz. Projeyi yayına almakla yetinmiyor; içerik yapısı, dönüşüm mantığı, teknik SEO, responsive davranış ve yönetilebilirlik gibi başlıkları da teslimatın doğal parçası olarak görüyoruz.",
            features: [
                "Kurumsal web sitesi, panel ve SaaS ürün geliştirme",
                "Özel yazılım, üyelik sistemi ve iş akışı otomasyonu",
                "Responsive arayüz, modern UI/UX ve yönetim paneli kurgusu",
                "REST API geliştirme, üçüncü taraf entegrasyonlar ve veri akışı planlama",
                "Teknik SEO, Core Web Vitals ve performans optimizasyonu",
                "Yayınlama, bakım, teknik destek ve geliştirme sonrası iyileştirme",
            ],
            faq: [
                {
                    q: "Hangi teknoloji yığınını kullanıyorsunuz?",
                    a: "Projelerimizde ağırlıklı olarak Next.js, React, TypeScript ve Node.js kullanıyoruz. Veri katmanında PostgreSQL ve Prisma, dağıtım tarafında ise modern bulut altyapılarını tercih ediyoruz. Ancak teknoloji seçimini sabit bir şablonla değil, projenin gerçek ihtiyacına göre yapıyoruz.",
                },
                {
                    q: "Proje ne kadar sürede tamamlanır?",
                    a: "Kurumsal web siteleri çoğu zaman 2 ila 5 hafta aralığında, daha kapsamlı panel veya SaaS ürünleri ise 4 ila 12 hafta aralığında şekillenir. Net süre; içerik hazırlığı, entegrasyon ihtiyacı, kullanıcı rol yapısı ve proje kapsamına göre belirlenir. Biz ilk görüşmeden sonra gerçekçi ve bölümlenmiş bir teslim planı sunarız.",
                },
                {
                    q: "Yalnızca sıfırdan proje mi yapıyorsunuz, mevcut sistemi de geliştiriyor musunuz?",
                    a: "Her ikisini de yapıyoruz. Eğer mevcut siteniz yavaşsa, mobilde zayıf görünüyorsa, dönüşüm üretmiyorsa ya da paneliniz geliştirmeye ihtiyaç duyuyorsa, sıfırdan başlamadan da iyileştirme yapılabilir. Çoğu zaman doğru yaklaşım, mevcut yapıyı teknik ve ticari olarak yeniden düzenlemektir.",
                },
                {
                    q: "Yayına geçtikten sonra destek alabilir miyim?",
                    a: "Evet. Yayın sonrası bakım, performans iyileştirmesi, içerik güncellemesi, hata düzeltmeleri ve yeni modül geliştirmeleri için destek veriyoruz. İhtiyaca göre tek seferlik geliştirme veya düzenli bakım modeliyle ilerleyebiliyoruz.",
                },
            ],
        },
        en: {
            title: "Web and Application Development",
            subtitle: "Fast, secure and scalable software delivery for corporate websites, client dashboards, and custom digital products",
            content: "At ZYGSOFT we do more than design interfaces. We build the digital infrastructure behind how a business presents itself, operates, and converts users into action. From corporate websites and client dashboards to SaaS tools and internal workflow systems, we approach the build through performance, maintainability, search visibility, and conversion logic. Using modern frontend architecture with reliable backend systems, we deliver products that are both technically solid and commercially useful.",
            features: [
                "Corporate websites, dashboards, and SaaS product development",
                "Custom software, membership systems, and workflow automation",
                "Responsive UI, modern UX, and admin/client panel design",
                "REST API development, integrations, and data flow planning",
                "Technical SEO, Core Web Vitals, and performance optimisation",
                "Deployment, maintenance, technical support, and post-launch improvements",
            ],
            faq: [
                {
                    q: "What technology stack do you use?",
                    a: "We primarily use Next.js, React, TypeScript, and Node.js. On the data layer we commonly work with PostgreSQL and Prisma, and deploy on modern cloud platforms. That said, we do not force every project into the same stack; the final architecture depends on the real business need.",
                },
                {
                    q: "How long does a project take to complete?",
                    a: "Corporate websites are often delivered within 2 to 5 weeks, while broader dashboards or SaaS products usually take 4 to 12 weeks. The real timeline depends on scope, content readiness, integration needs, and role structure. We provide a phased and realistic roadmap after the initial discovery.",
                },
                {
                    q: "Do you only build from scratch, or can you improve an existing system too?",
                    a: "We do both. If your current site is slow, weak on mobile, hard to manage, or not converting well, we can improve what already exists instead of forcing a full rebuild when it is not necessary.",
                },
                {
                    q: "Can I get support after my project goes live?",
                    a: "Yes. We provide post-launch support, maintenance, performance improvements, fixes, and additional feature work. Depending on the project, we can continue through ad hoc updates or an ongoing support model.",
                },
            ],
        },
    },

    "sosyal-medya-yonetimi": {
        tr: {
            title: "Sosyal Medya Yönetimi",
            subtitle: "Marka tutarlılığı, içerik disiplini ve görünür büyüme için stratejik sosyal medya yönetimi",
            content: "Sosyal medya yönetimini sadece post paylaşmak olarak görmüyoruz. İçerik planı, yayın disiplini, marka tonu, görsel tutarlılık, kampanya hedefi ve performans takibi birlikte ele alındığında sosyal medya gerçek bir büyüme kanalına dönüşür. ZYGSOFT olarak markanızın bulunduğu aşamaya göre platform seçimi, içerik takvimi, yaratıcı üretim, topluluk dili ve reklam destekli görünürlük planı oluşturuyoruz. Böylece sosyal medya; dağınık bir yayın akışı değil, daha kontrollü bir iletişim ve güven altyapısı haline gelir.",
            features: [
                "Aylık içerik planı, yayın takvimi ve onay süreci",
                "Instagram, LinkedIn, TikTok ve benzeri platformlara özel strateji",
                "Özgün tasarım, kısa video ve marka tonuna uygun metin üretimi",
                "Rakip izleme, hedef kitle davranışı ve içerik yönü analizi",
                "Organik iletişim ile ücretli görünürlüğün birlikte planlanması",
                "Aylık performans raporu ve içerik optimizasyon önerileri",
            ],
            faq: [
                {
                    q: "Kaç platform için içerik üretiyorsunuz?",
                    a: "Temel yapı çoğu zaman Instagram ve LinkedIn üzerinden kuruluyor; ancak sektör, hedef kitle ve içerik formatına göre TikTok, Facebook, X veya YouTube gibi ek kanallar da dahil edilebilir. Burada amaç her yerde olmak değil, doğru yerde etkili olmaktır.",
                },
                {
                    q: "Gönderilerin onay süreci nasıl işliyor?",
                    a: "İçerik planı aylık veya periyodik olarak hazırlanır, metinler ve tasarımlar onayınıza sunulur, ardından yayınlama takvimi netleştirilir. Böylece son dakika dağınıklığı yerine kontrollü ve izlenebilir bir sistem kurulur.",
                },
                {
                    q: "Sadece içerik mi üretiyorsunuz, reklam tarafını da destekliyor musunuz?",
                    a: "İçerik yönetimi ile reklam görünürlüğünü birbirinden kopuk ele almıyoruz. Organik içerik çizgisi kurulurken aynı zamanda Meta reklamları veya ilgili performans kampanyaları için daha güçlü mesaj ve kreatif zemini de hazırlıyoruz.",
                },
                {
                    q: "Sosyal medya yönetimi her işletme için aynı modelde mi ilerler?",
                    a: "Hayır. Bazı markalarda daha çok kurumsal görünürlük ve güven inşası gerekirken, bazı markalarda talep toplama ve reklam destekli büyüme öne çıkar. İçerik planını bu iş ihtiyacına göre şekillendiriyoruz.",
                },
            ],
        },
        en: {
            title: "Social Media Management",
            subtitle: "Strategic social media management for stronger brand consistency, visibility, and measurable growth",
            content: "We do not treat social media as random posting. When content planning, visual consistency, platform logic, publishing discipline, and performance signals are aligned, social media becomes a serious business channel. At ZYGSOFT we shape platform choice, content calendars, creative direction, and reporting based on the stage your brand is in. The result is a more intentional communication system rather than a scattered feed.",
            features: [
                "Monthly content planning, publishing calendar, and approval flow",
                "Platform-specific strategy for Instagram, LinkedIn, TikTok, and more",
                "Original design, short-form video, and brand-aligned copywriting",
                "Competitor review, audience behaviour insight, and content direction",
                "Stronger coordination between organic content and paid visibility",
                "Monthly performance reporting and optimisation recommendations",
            ],
            faq: [
                {
                    q: "How many platforms do you produce content for?",
                    a: "The initial setup often focuses on Instagram and LinkedIn, but additional channels such as TikTok, Facebook, X, or YouTube can be included depending on audience behaviour and content format. The goal is not to be everywhere, but to be effective in the right places.",
                },
                {
                    q: "How does the post approval process work?",
                    a: "We prepare a content plan on a monthly or periodic basis, present the copy and visuals for approval, and then move into scheduling. This creates a more controlled and predictable publishing workflow instead of last-minute chaos.",
                },
                {
                    q: "Do you only produce content, or do you also support paid visibility?",
                    a: "We support both. While building the organic content structure, we also shape the message and creative direction that can be used in Meta or other paid campaigns, so social growth and advertising are not disconnected.",
                },
                {
                    q: "Is the same model applied to every business?",
                    a: "No. Some brands need more trust-building and corporate visibility, while others need faster demand generation. The content structure is adapted to the actual business objective.",
                },
            ],
        },
    },

    "marka-kimligi-ve-grafik-tasarim": {
        tr: {
            title: "Marka Kimliği ve Grafik Tasarım",
            subtitle: "Logo, görsel dil ve marka sistemini yalnızca güzel değil, stratejik ve kullanılabilir hale getiren tasarım hizmeti",
            content: "Marka kimliği sadece logo tasarımı değildir; ilk izlenim, güven duygusu, ayrışma seviyesi ve dijital görünümün tamamıdır. ZYGSOFT olarak marka tasarımını hem estetik hem de işlevsel bir sistem olarak ele alıyoruz. Logo, renk paleti, tipografi, dijital kullanım kuralları, sosyal medya görsel dili ve temel marka davranışlarını birlikte tasarlayarak daha net ve tutarlı bir kurumsal görünüm kuruyoruz. Böylece markanız yalnızca şık değil, her temas noktasında daha tanınır ve daha güvenilir hale gelir.",
            features: [
                "Özgün logo yönü, marka sembolü ve varyasyon tasarımı",
                "Renk paleti, tipografi sistemi ve görsel kullanım mantığı",
                "Brand guideline ve kurumsal kullanım çerçevesi",
                "Sosyal medya, web ve sunum ortamları için tasarım şablonları",
                "Kartvizit, broşür, katalog ve temel basılı materyal tasarımları",
                "Vektörel, baskıya hazır ve dijital kullanım dosyalarının teslimi",
            ],
            faq: [
                {
                    q: "Logo tasarımında kaç konsept sunuyorsunuz?",
                    a: "Süreç genellikle birden fazla yön gösteren ilk konseptle başlar. Amaç sadece alternatif göstermek değil, markanın en güçlü görsel eksenini bulmaktır. Seçilen yön üzerinde kontrollü revizyonlarla ilerleyerek oturan bir sonuç çıkarıyoruz.",
                },
                {
                    q: "Teslim dosyalarında hangi formatlar yer alıyor?",
                    a: "Teslim içeriğinde baskıya uygun dosyalar, vektörel formatlar ve dijital kullanım sürümleri yer alır. Ayrıca markanın farklı zeminlerde nasıl kullanılacağına dair temel bir kılavuz da sunulur.",
                },
                {
                    q: "Sadece logo mu tasarlıyorsunuz?",
                    a: "İstenirse yalnızca logo tasarlanabilir, ancak güçlü bir marka algısı için çoğu zaman logo tek başına yeterli olmaz. Marka kimliğini bir sistem olarak kurmak; web sitesi, sosyal medya ve sunumlarda çok daha bütünlüklü sonuç verir.",
                },
                {
                    q: "Mevcut markamı tamamen değiştirmeden iyileştirebilir misiniz?",
                    a: "Evet. Her projede radikal bir yeniden marka kurgusu gerekmez. Mevcut kimliği koruyup modernize etmek, daha kullanılabilir hale getirmek veya dijital mecralara uygun biçimde güncellemek de mümkündür.",
                },
            ],
        },
        en: {
            title: "Brand Identity and Graphic Design",
            subtitle: "Design service that makes your brand system not only attractive, but usable, strategic, and consistent",
            content: "Brand identity is more than a logo. It shapes first impressions, trust, differentiation, and the visual consistency of your entire digital presence. At ZYGSOFT we approach brand design as both an aesthetic and operational system. By aligning logo direction, colour palette, typography, usage rules, social visual language, and digital application, we help brands look more intentional and more credible across all touchpoints.",
            features: [
                "Original logo direction, symbol system, and variations",
                "Colour palette, typography system, and visual usage logic",
                "Brand guideline and corporate application framework",
                "Design templates for web, presentations, and social media",
                "Business cards, brochures, catalogues, and print materials",
                "Vector, print-ready, and digital delivery formats",
            ],
            faq: [
                {
                    q: "How many concepts do you present for logo design?",
                    a: "The process usually begins with multiple visual directions. The goal is not simply to show alternatives, but to identify the strongest visual axis for the brand. From there we refine the chosen direction through focused revisions.",
                },
                {
                    q: "What file formats are included in the delivery?",
                    a: "The delivery typically includes print-ready files, vector formats, and digital assets, along with practical guidance on how the identity should behave across different surfaces and contexts.",
                },
                {
                    q: "Can you design only a logo?",
                    a: "Yes, but in many cases a logo alone is not enough. A stronger result usually comes from building a system that can work across the website, social content, and presentations in a coherent way.",
                },
                {
                    q: "Can you improve an existing brand without rebuilding it completely?",
                    a: "Absolutely. Not every brand needs a full reset. We can modernise, simplify, and adapt an existing identity so it performs better in digital environments while keeping recognisable elements intact.",
                },
            ],
        },
    },

    "dijital-strateji-ve-pazarlama": {
        tr: {
            title: "Dijital Strateji ve Pazarlama",
            subtitle: "SEO, içerik, teklif yapısı ve reklam akışlarını aynı büyüme planında birleştiren stratejik danışmanlık",
            content: "Dijital pazarlama sadece reklam hesabı açmak değildir. Doğru sonuç; doğru teklif, doğru sayfa, doğru ölçüm, doğru kitle ve doğru içerik bir araya geldiğinde oluşur. ZYGSOFT olarak markanızın mevcut dijital görünümünü analiz ediyor, SEO, landing page yapısı, teklif mimarisi, organik görünürlük ve reklam akışlarını tek bir büyüme planı içinde kurguluyoruz. Böylece daha çok trafik almak yerine, daha kaliteli başvuru, daha güçlü dönüşüm oranı ve daha ölçülebilir büyüme üretmeye odaklanıyoruz.",
            features: [
                "Dijital büyüme yol haritası ve kanal önceliklendirme",
                "SEO ve içerik stratejisi ile organik görünürlük planı",
                "Landing page, teklif akışı ve CTA yapılarının iyileştirilmesi",
                "Google Ads ve Meta kampanyalarıyla uyumlu mesaj kurgusu",
                "Analitik, event takibi ve veri okuma altyapısı tasarımı",
                "Aylık strateji değerlendirmesi ve optimizasyon önerileri",
            ],
            faq: [
                {
                    q: "Bu hizmet reklam yönetiminden farklı mı?",
                    a: "Evet. Reklam yönetimi daha çok hesap içi uygulama ve optimizasyon tarafına odaklanırken, dijital strateji hizmeti hangi kanalın neden kullanılacağını, teklif yapısının nasıl kurulacağını ve sistemin nasıl birlikte işleyeceğini planlar.",
                },
                {
                    q: "SEO bu hizmete dahil mi?",
                    a: "Gerektiğinde evet. Teknik SEO, sayfa yapısı, içerik yönü, anahtar kelime önceliklendirmesi ve arama niyetine uygun sayfa kurgusu bu hizmetin parçası olabilir.",
                },
                {
                    q: "Küçük işletmeler için de uygun mu?",
                    a: "Kesinlikle. Özellikle sınırlı bütçeyle daha doğru önceliklendirme yapılması gerektiği için stratejik yaklaşım küçük işletmelerde daha fazla değer üretir.",
                },
                {
                    q: "Bu hizmeti hangi diğer hizmetlerle birlikte almak daha verimli olur?",
                    a: "Çoğu zaman web geliştirme, reklam yönetimi, analitik kurulum veya sosyal medya yönetimi ile birlikte çalıştığında çok daha güçlü sonuç verir. Çünkü stratejinin uygulamaya geçmesi gerekir.",
                },
            ],
        },
        en: {
            title: "Digital Strategy and Marketing",
            subtitle: "Strategic consultancy that connects SEO, content, offer structure, and paid growth into one plan",
            content: "Digital marketing is not simply opening an ad account. Meaningful results come from the combination of the right offer, the right page, the right measurement system, the right audience, and the right message. At ZYGSOFT we analyse your current digital presence and shape SEO, landing pages, conversion structure, organic visibility, and advertising flows into one growth plan. That means we focus less on vanity traffic and more on qualified enquiries, conversion performance, and measurable growth.",
            features: [
                "Digital growth roadmap and channel prioritisation",
                "SEO and content strategy for long-term visibility",
                "Landing page, offer, and CTA optimisation",
                "Message planning aligned with Google Ads and Meta campaigns",
                "Analytics, event tracking, and reporting architecture",
                "Monthly strategic review and optimisation direction",
            ],
            faq: [
                {
                    q: "Is this different from ad management?",
                    a: "Yes. Ad management focuses on execution and optimisation inside the platforms, while this service defines the broader system: channels, offers, messaging, structure, and measurement.",
                },
                {
                    q: "Is SEO included in this service?",
                    a: "Yes, when needed. Technical SEO, page architecture, content direction, keyword prioritisation, and intent-based planning can all be part of the work.",
                },
                {
                    q: "Is this suitable for small businesses too?",
                    a: "Absolutely. Strategy is often even more valuable when resources are limited, because clearer prioritisation prevents wasted effort and budget.",
                },
                {
                    q: "Which other services pair well with this one?",
                    a: "It often performs best when combined with web development, ad management, analytics setup, or social media execution, because strategy becomes more useful when it is turned into action.",
                },
            ],
        },
    },

    "google-ads-ve-meta-pixel-reklam-yonetimi": {
        tr: {
            title: "Google Ads ve Meta Pixel Reklam Yönetimi",
            subtitle: "Google Ads, Meta reklam yönetimi, Google Tag Manager ve Analytics kurulumu ile ölçülebilir reklam altyapısı",
            content: "Bir reklam hesabını açmak kolaydır; asıl fark reklamların nereye yönlendiği, hangi olayların ölçüldüğü, hangi dönüşümlerin takip edildiği ve hangi kampanyanın gerçekten sonuç ürettiğinin net biçimde görülmesiyle oluşur. Bu hizmette Google Ads ve Meta reklam yönetimini, Google Tag Manager kurulumu, Google Analytics entegrasyonu, event takibi, form ve tıklama dönüşümleri, Pixel kurulumu ve temel remarketing altyapısıyla birlikte ele alıyoruz. Böylece sadece reklam çıkmıyor; reklam hesabınız, açılış sayfalarınız, CTA yapınız ve ölçüm sistemi tek bir performans çatısı altında çalışıyor.",
            features: [
                "Google Ads hesap kurulumu, kampanya yapısı ve optimizasyonu",
                "Meta reklam hesabı ve Pixel kurulumları",
                "Google Tag Manager ve Google Analytics entegrasyonu",
                "Form, trial, satın alma, telefon ve buton tıklamaları için event takibi",
                "Landing page, teklif ve reklam mesajı uyumluluğunun iyileştirilmesi",
                "Aylık performans raporu, bütçe yorumu ve optimizasyon aksiyonları",
            ],
            faq: [
                {
                    q: "Bu hizmete Google Tag Manager ve Analytics kurulumu dahil mi?",
                    a: "Evet. Bu hizmetin önemli bir parçası ölçüm altyapısı olduğu için GTM, GA4, temel dönüşüm eventleri ve gerekli reklam takip kurulumları hizmete dahildir.",
                },
                {
                    q: "Google Ads ve Meta reklamlarını birlikte yönetiyor musunuz?",
                    a: "Evet. Hedefinize göre yalnızca Google Ads, yalnızca Meta reklamları veya iki kanalı birlikte yönetebiliyoruz. Burada önemli olan kanal sayısı değil, bütçenin en verimli şekilde çalışmasıdır.",
                },
                {
                    q: "Reklam bütçesi size mi ödeniyor?",
                    a: "Hayır. Reklam harcaması doğrudan sizin Google veya Meta hesabınızdan yapılır. Biz hesap kurulumu, kampanya stratejisi, optimizasyon ve raporlama tarafını yönetiriz.",
                },
                {
                    q: "Bu hizmet kimler için özellikle uygundur?",
                    a: "Lead toplamak, randevu almak, hizmet satmak veya dijital ürün aboneliği büyütmek isteyen işletmeler için çok uygundur. Özellikle ölçüm altyapısı eksik olan markalarda hızlı fayda üretir.",
                },
            ],
        },
        en: {
            title: "Google Ads and Meta Pixel Advertising Management",
            subtitle: "A measurable advertising system with Google Ads, Meta campaigns, Google Tag Manager, and Analytics",
            content: "Opening an ad account is easy. The real difference comes from where traffic is sent, what events are measured, which conversions are tracked, and how clearly you can see what is actually producing results. In this service we manage Google Ads and Meta campaigns together with Google Tag Manager setup, Google Analytics integration, event tracking, form and click conversions, Pixel implementation, and the foundations of remarketing. That means we are not simply launching campaigns; we are aligning your ad accounts, landing pages, CTA structure, and measurement system into one performance framework.",
            features: [
                "Google Ads setup, campaign structure, and optimisation",
                "Meta ad account and Pixel implementation",
                "Google Tag Manager and Google Analytics integration",
                "Event tracking for forms, trials, purchases, phone clicks, and CTA clicks",
                "Landing page, offer, and ad message alignment improvements",
                "Monthly reporting, budget interpretation, and optimisation action plans",
            ],
            faq: [
                {
                    q: "Does this service include Google Tag Manager and Analytics setup?",
                    a: "Yes. Measurement is a core part of this service, so GTM, GA4, foundational conversion events, and ad tracking setup are included.",
                },
                {
                    q: "Do you manage Google Ads and Meta campaigns together?",
                    a: "Yes. Depending on your goals, we can manage either channel separately or both together. The focus is always on efficiency and clarity, not just platform volume.",
                },
                {
                    q: "Is the ad budget paid to you?",
                    a: "No. Advertising spend is paid directly through your own Google or Meta accounts. We handle strategy, setup, optimisation, and reporting.",
                },
                {
                    q: "Who is this service especially useful for?",
                    a: "It is especially valuable for businesses that want more qualified leads, consultations, service enquiries, or digital product subscriptions, particularly when they do not yet have a reliable tracking setup.",
                },
            ],
        },
    },
};
