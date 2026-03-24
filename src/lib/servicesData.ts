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
            subtitle: "SEO, içerik, reklam ve dönüşüm akışını tek stratejide birleştiren veri odaklı büyüme danışmanlığı",
            content: "İyi bir ürün ya da güçlü bir hizmet tek başına yeterli değildir; doğru kişiye, doğru mesajla ve doğru anda ulaşmak gerekir. ZYGSOFT olarak dijital pazarlamayı kanal bazlı parçalar halinde değil, bütünleşik büyüme sistemi olarak kurguluyoruz. Teknik SEO, içerik yönü, reklam görünürlüğü, analitik kurulum ve dönüşüm akışını birlikte ele alıyor; trafiğin yalnızca artmasını değil, daha nitelikli aksiyona dönüşmesini hedefliyoruz. Böylece pazarlama bütçesi daha okunur, kararlar daha veriye dayalı hale gelir.",
            features: [
                "Teknik SEO, içerik yönü ve anahtar kelime stratejisi",
                "Google Ads ve performans kampanyası planı",
                "Meta reklamları, yeniden pazarlama ve hedef kitle kurgusu",
                "Dönüşüm oranı optimizasyonu ve sayfa akışı iyileştirmesi",
                "Google Analytics, Tag Manager ve veri temelli karar altyapısı",
                "Düzenli raporlama, yorumlama ve strateji güncellemesi",
            ],
            faq: [
                {
                    q: "Sonuçları ne zaman görmeye başlarım?",
                    a: "Bu, kullanılan kanal ve başlangıç noktasına göre değişir. Reklam tarafında ilk sinyaller daha hızlı gelirken, SEO ve içerik yatırımı daha orta vadede büyür. Biz kısa vadeli görünürlük ile uzun vadeli sürdürülebilirliği aynı planda değerlendiririz.",
                },
                {
                    q: "Minimum reklam bütçesi nedir?",
                    a: "Tek bir sabit bütçe yoktur. Doğru bütçe; sektör, hedef, teklif modeli, coğrafi alan ve sayfa altyapısına göre belirlenir. İlk görüşmede çoğu zaman sadece reklam harcamasını değil, dönüşüm kapasitesini de birlikte değerlendiriyoruz.",
                },
                {
                    q: "SEO ile reklam arasında ne tercih etmeliyim?",
                    a: "Çoğu durumda bunlardan birini seçmek yerine birlikte çalıştırmak daha doğrudur. Reklam hızlı görünürlük sağlar, SEO ise daha sürdürülebilir bir zemin oluşturur. Hangi oranda kullanılacağı iş hedefinize göre belirlenir.",
                },
                {
                    q: "Sadece trafik mi raporluyorsunuz, gerçek iş çıktısına da bakıyor musunuz?",
                    a: "Trafik tek başına yeterli bir metrik değildir. Form gönderimi, kayıt, trial başlatma, ödeme bildirimi veya satın alma gibi daha anlamlı aksiyonlara odaklanıyoruz. Bu nedenle analitik kurulum ve dönüşüm takibi pazarlama işinin temel parçasıdır.",
                },
            ],
        },
        en: {
            title: "Digital Strategy and Marketing",
            subtitle: "Data-driven growth strategy that aligns SEO, content, ads, and conversion flow into one measurable system",
            content: "A strong product or service is not enough on its own. You also need to reach the right people with the right message at the right time. At ZYGSOFT we do not treat digital marketing as isolated channels; we design it as an integrated growth system. By combining technical SEO, content direction, paid visibility, analytics setup, and conversion flow, we help businesses turn traffic into more qualified action rather than vanity metrics.",
            features: [
                "Technical SEO, content direction, and keyword strategy",
                "Google Ads and performance campaign planning",
                "Meta advertising, remarketing, and audience strategy",
                "Conversion rate optimisation and funnel improvement",
                "Google Analytics, Tag Manager, and decision-grade tracking",
                "Ongoing reporting, interpretation, and strategy updates",
            ],
            faq: [
                {
                    q: "When will I start seeing results?",
                    a: "It depends on the channel mix and starting point. Paid campaigns usually generate signals faster, while SEO and content build strength over a longer horizon. We evaluate short-term visibility and long-term sustainability together.",
                },
                {
                    q: "What is the minimum advertising budget?",
                    a: "There is no universal minimum. The right budget depends on industry, targeting scope, offer structure, and the strength of the landing experience. We prefer evaluating conversion capacity together with budget, not media spend in isolation.",
                },
                {
                    q: "Should I choose SEO or paid ads?",
                    a: "In most cases they should work together. Paid ads create faster visibility, while SEO builds a stronger long-term base. The right balance depends on your business goals and timing.",
                },
                {
                    q: "Do you report only traffic, or real business outcomes too?",
                    a: "Traffic alone is not enough. We care more about meaningful events such as leads, sign-ups, trial starts, payment notifications, or purchases. That is why analytics and conversion tracking are a core part of the service.",
                },
            ],
        },
    },
    "google-ads-ve-meta-pixel-reklam-yonetimi": {
        tr: {
            title: "Google Ads ve Meta Pixel Reklam Yönetimi",
            subtitle: "Reklam kurulumundan dönüşüm takibine kadar Google Ads, Meta Pixel, Tag Manager ve Analytics dahil tam performans altyapısı",
            content: "Bu hizmet yalnızca reklam açmakla sınırlı değildir. ZYGSOFT olarak Google Ads kampanya kurgusu, Meta Pixel kurulumu, Google Tag Manager yapılandırması, Google Analytics entegrasyonu ve dönüşüm event takibini tek sistem halinde kuruyoruz. Böylece işletmeniz yalnızca trafik almakla kalmaz; hangi kampanyanın form getirdiğini, hangi reklamın kayıt veya trial başlattığını ve hangi sayfanın satın alma yolunu güçlendirdiğini görebilir. Reklam hesabı, ölçüm altyapısı ve sayfa dönüşüm mantığı birlikte ele alındığında bütçe daha verimli kullanılır ve kararlar daha net hale gelir.",
            features: [
                "Google Ads hesap yapısı, kampanya ve reklam grubu kurgusu",
                "Meta Pixel kurulumu, event planlama ve remarketing altyapısı",
                "Google Tag Manager ve Google Analytics kurulum ve düzenlemesi",
                "Form, kayıt, trial, ödeme ve satın alma dönüşümlerinin takibi",
                "Landing page ve teklif akışına göre reklam-dönüşüm uyumu optimizasyonu",
                "Raporlama, yorumlama ve reklam bütçesi verimliliğini artıran düzenli iyileştirme",
            ],
            faq: [
                {
                    q: "Bu hizmette sadece reklam yönetimi mi var, kurulumlar da dahil mi?",
                    a: "Kurulumlar da dahil. Reklam hesabı düzeni kadar Meta Pixel, Google Tag Manager, Google Analytics ve dönüşüm eventlerinin doğru çalışması da bu hizmetin parçası. Yani yalnızca reklam açmıyor, ölçüm altyapısını da kuruyoruz.",
                },
                {
                    q: "Google Ads ile Meta reklamlarını birlikte mi yönetiyorsunuz?",
                    a: "İhtiyaca göre evet. Bazı işletmeler için yalnızca Google tarafı yeterliyken, bazıları için Meta ile yeniden pazarlama ve talep toplama birlikte daha verimli olur. Kanal kararı iş modeli, teklif yapısı ve hedef kitleye göre verilir.",
                },
                {
                    q: "Google Analytics ve Tag Manager neden bu kadar önemli?",
                    a: "Çünkü reklam yönetiminde gerçek performansı görmek için yalnızca tıklama verisi yetmez. Form gönderimi, kayıt, trial başlatma, ödeme bildirimi ve satın alma gibi aksiyonları doğru ölçmediğiniz sürece hangi kampanyanın gerçekten işe yaradığını anlayamazsınız.",
                },
                {
                    q: "Meta Pixel ve Google etiketleri kurulunca veri hemen görünür mü?",
                    a: "Çoğu kurulumda ilk sinyaller hızlı gelir; ancak platformların veriyi olgunlaştırması biraz zaman alabilir. Biz kurulum sonrası test, tetikleme kontrolü ve temel kalite doğrulamasını yaparak sistemin sağlıklı çalıştığından emin oluruz.",
                },
                {
                    q: "Bu hizmet sayfa iyileştirmesini de kapsıyor mu?",
                    a: "Evet, gerektiğinde kapsar. Reklamlar iyi kurulsa bile açılış sayfası zayıfsa dönüşüm düşer. Bu yüzden CTA yapısı, form deneyimi, mobil görünüm ve güven sinyalleri gibi başlıkları da birlikte değerlendiriyoruz.",
                },
            ],
        },
        en: {
            title: "Google Ads and Meta Pixel Ad Management",
            subtitle: "Performance advertising service that includes Google Ads, Meta Pixel, Google Tag Manager, and Analytics setup",
            content: "This service goes beyond launching ads. At ZYGSOFT we build the full performance layer around your campaigns: Google Ads structure, Meta Pixel implementation, Google Tag Manager setup, Google Analytics integration, and conversion event tracking. That means your business does not just buy traffic — it gains visibility into which campaign generated a lead, which ad drove a sign-up or trial, and where the conversion path needs improvement. When media buying, tracking, and landing experience are aligned, budgets become more efficient and decisions become much clearer.",
            features: [
                "Google Ads account structure, campaigns, and ad group planning",
                "Meta Pixel setup, event design, and remarketing foundation",
                "Google Tag Manager and Google Analytics implementation",
                "Tracking for leads, sign-ups, trials, payments, and purchases",
                "Alignment between campaigns, landing pages, and conversion logic",
                "Reporting, interpretation, and ongoing improvement for budget efficiency",
            ],
            faq: [
                {
                    q: "Is this only ad management, or does setup work come with it too?",
                    a: "Setup work is included. We handle not only campaign structure, but also Meta Pixel, Google Tag Manager, Google Analytics, and meaningful conversion events so the account can actually be measured correctly.",
                },
                {
                    q: "Do you manage both Google Ads and Meta together?",
                    a: "Yes, when it makes sense. Some businesses benefit more from Google search intent, while others need Meta for retargeting or demand generation. The final mix depends on the business model, offer, and audience behaviour.",
                },
                {
                    q: "Why are Analytics and Tag Manager so important here?",
                    a: "Because clicks alone do not tell you what is working. If you cannot properly measure leads, sign-ups, trials, payments, or purchases, you cannot know which campaigns are producing real value. Tracking is the foundation of responsible ad management.",
                },
                {
                    q: "Will data appear immediately after the tags are installed?",
                    a: "Initial signals usually arrive quickly, but platforms still need some time to stabilise and interpret incoming data. We test and validate the setup after installation to make sure the system is firing correctly.",
                },
                {
                    q: "Does this include landing page improvement as well?",
                    a: "When needed, yes. Strong campaigns cannot compensate for weak landing pages forever. We also review CTA logic, forms, mobile presentation, and trust signals so the traffic has a better chance of converting.",
                },
            ],
        },
    },
};
