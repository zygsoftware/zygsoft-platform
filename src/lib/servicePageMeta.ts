export type ServicePlatformKey =
  | "instagram"
  | "facebook"
  | "meta"
  | "google-ads"
  | "whatsapp";

export type ServicePlatform = {
  label: string;
  key?: ServicePlatformKey;
};

export type ServiceStat = {
  value: string;
  label: string;
  detail: string;
};

export type ServiceWorkflowStep = {
  title: string;
  body: string;
};

export type ServiceLocaleMeta = {
  heroLabel: string;
  sectionLabel: string;
  platformsLabel: string;
  platforms: ServicePlatform[];
  stats: ServiceStat[];
  deliverablesTitle: string;
  deliverables: string[];
  workflowTitle: string;
  workflowIntro: string;
  workflow: ServiceWorkflowStep[];
  spotlightTitle: string;
  spotlightBody: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  contentTitle: string;
  gainsTitle: string;
  faqTitle: string;
  faqIntro: string;
};

export type ServiceMeta = {
  tr: ServiceLocaleMeta;
  en: ServiceLocaleMeta;
};

export const servicePageMeta: Record<string, ServiceMeta> = {
  "web-ve-uygulama-gelistirme": {
    tr: {
      heroLabel: "Yazılım Mimarisi",
      sectionLabel: "Hizmet Detayı",
      platformsLabel: "Kullandığımız yapı",
      platforms: [
        { label: "Next.js" },
        { label: "React" },
        { label: "TypeScript" },
        { label: "Node.js" },
        { label: "PostgreSQL" },
      ],
      stats: [
        { value: "SEO +", label: "Teknik kurgu", detail: "Performans, indekslenebilirlik ve dönüşüm birlikte ele alınır." },
        { value: "Panel", label: "Yönetilebilir yapı", detail: "Sadece vitrin değil, yönetilebilir operasyon ekranları kurulur." },
        { value: "API", label: "Entegrasyon hazır", detail: "CRM, ödeme, form ve üçüncü taraf servis akışları planlanır." },
      ],
      deliverablesTitle: "Tipik teslimatlar",
      deliverables: [
        "Kurumsal site veya ürün arayüzü bilgi mimarisi",
        "Admin / müşteri paneli ekranları ve kullanıcı rol yapısı",
        "Teknik SEO, performans ve responsive kalite kontrolü",
        "İçerik girişine uygun modüler CMS veya yönetim alanı",
        "Form, lead, satış ve kullanıcı hareketleri için takip altyapısı",
        "Yayına alma, bakım planı ve sonraki iterasyon yol haritası",
      ],
      workflowTitle: "Nasıl ilerliyoruz?",
      workflowIntro: "Yazılım işini yalnızca tasarım veya yalnızca kod olarak değil, ticari hedefe çalışan sistem tasarımı olarak ele alıyoruz.",
      workflow: [
        { title: "Analiz ve hedef netleştirme", body: "Sitenin ne yapması gerektiğini, kim için çalışacağını ve hangi dönüşümü taşıyacağını birlikte netleştiriyoruz." },
        { title: "Bilgi mimarisi ve ekran kurgusu", body: "Sayfa yapısını, kullanıcı yolculuğunu, modülleri ve yönetim ekranlarını üretim öncesi netleştiriyoruz." },
        { title: "Geliştirme ve entegrasyon", body: "Frontend, backend, veri akışı ve üçüncü taraf bağlantıları kontrollü şekilde inşa ediyoruz." },
        { title: "Yayın ve optimizasyon", body: "Canlıya alma sonrası hız, içerik, SEO ve dönüşüm tarafında ince ayarlarla sistemi olgunlaştırıyoruz." },
      ],
      spotlightTitle: "Bu hizmet en çok kime yarar?",
      spotlightBody: "Kurumsal bir dijital vitrin isteyen markalara, müşteri paneli kurmak isteyen işletmelere ve abonelik / operasyon ürünü geliştirmek isteyen girişimlere doğrudan değer üretir.",
      ctaTitle: "Projenizin teknik omurgasını birlikte kuralım",
      ctaBody: "Kurumsal site, dashboard, müşteri paneli veya özel ürün akışınız için kapsamı birlikte çıkaralım. İlk görüşmede ihtiyaçları netleştirip gerçekçi bir yol haritası sunuyoruz.",
      ctaButton: "Ücretsiz Teklif Alın",
      contentTitle: "Hizmet Kapsamı",
      gainsTitle: "Bu Hizmetle Neler Kazanırsınız?",
      faqTitle: "Sıkça Sorulan Sorular",
      faqIntro: "Süreç, teslimat ve teknik altyapı hakkında en sık gelen sorular.",
    },
    en: {
      heroLabel: "Software Architecture",
      sectionLabel: "Service Detail",
      platformsLabel: "Typical stack",
      platforms: [
        { label: "Next.js" },
        { label: "React" },
        { label: "TypeScript" },
        { label: "Node.js" },
        { label: "PostgreSQL" },
      ],
      stats: [
        { value: "SEO +", label: "Technical structure", detail: "Performance, indexability, and conversion are planned together." },
        { value: "Panel", label: "Manageable system", detail: "We build more than a website; we build usable operating interfaces." },
        { value: "API", label: "Integration ready", detail: "CRM, payments, forms, and third-party services are planned from the start." },
      ],
      deliverablesTitle: "Typical deliverables",
      deliverables: [
        "Information architecture for the corporate site or product interface",
        "Admin / client panel screens and role structure",
        "Technical SEO, performance, and responsive quality control",
        "Modular CMS or management area for content operations",
        "Tracking setup for leads, sales, forms, and user actions",
        "Launch support, maintenance plan, and next-iteration roadmap",
      ],
      workflowTitle: "How we work",
      workflowIntro: "We do not treat software as only design or only code. We treat it as a business system that must perform.",
      workflow: [
        { title: "Discovery and goals", body: "We define what the product needs to do, for whom it is built, and which conversion it should drive." },
        { title: "Structure and interface planning", body: "We map page architecture, user flow, modules, and operational screens before production." },
        { title: "Build and integration", body: "Frontend, backend, data flow, and third-party connections are implemented in a controlled sequence." },
        { title: "Launch and optimisation", body: "After launch, we improve speed, content structure, SEO, and conversion performance." },
      ],
      spotlightTitle: "Who benefits most?",
      spotlightBody: "This service is ideal for brands that need a credible digital presence, businesses that want a customer panel, and teams building a subscription or operations product.",
      ctaTitle: "Let’s design the technical backbone together",
      ctaBody: "If you need a corporate site, dashboard, client panel, or custom product flow, we can map the right scope and delivery path together.",
      ctaButton: "Request a Free Proposal",
      contentTitle: "Scope of Service",
      gainsTitle: "What You Gain With This Service",
      faqTitle: "Frequently Asked Questions",
      faqIntro: "The questions we hear most around delivery, workflow, and technical structure.",
    },
  },
  "sosyal-medya-yonetimi": {
    tr: {
      heroLabel: "Sosyal Büyüme Sistemi",
      sectionLabel: "Hizmet Detayı",
      platformsLabel: "Odak platformlar",
      platforms: [
        { label: "Instagram", key: "instagram" },
        { label: "Facebook", key: "facebook" },
        { label: "LinkedIn" },
        { label: "TikTok" },
        { label: "WhatsApp", key: "whatsapp" },
      ],
      stats: [
        { value: "Aylık", label: "İçerik disiplini", detail: "Dağınık paylaşım yerine takvimli ve onaylı üretim süreci kurulur." },
        { value: "Marka", label: "Tutarlı dil", detail: "Görsel ton, metin tonu ve CTA mantığı her içerikte aynı çizgiyi taşır." },
        { value: "Reach", label: "Organik + reklam uyumu", detail: "İçerikler hem görünürlük hem reklam kreatifi açısından kullanılır." },
      ],
      deliverablesTitle: "Bu hizmette neleri kuruyoruz?",
      deliverables: [
        "Aylık içerik takvimi ve yayın planı",
        "Instagram ve Facebook odaklı görsel seri ve carousel kurguları",
        "Reels / kısa video fikirleri ve akış metinleri",
        "Story dili, etkileşim akışı ve DM yönlendirme yapısı",
        "Organik görünürlük ile Meta reklam kreatiflerinin uyumlaştırılması",
        "Aylık performans özeti ve bir sonraki ay için içerik yönü",
      ],
      workflowTitle: "Sosyal medya yönetimini nasıl ele alıyoruz?",
      workflowIntro: "Sosyal medya bizim için sadece paylaşım değil; marka algısı, talep oluşturma ve güven inşası için çalışan yayın sistemidir.",
      workflow: [
        { title: "Marka dili ve hedef kitle analizi", body: "Markanın tonu, içerik omurgası, hangi platformda hangi mesajın öne çıkacağı belirlenir." },
        { title: "İçerik serileri ve kreatif plan", body: "Instagram, Facebook ve diğer kanallar için içerik serileri, tasarım çerçevesi ve yayın dengesi kurgulanır." },
        { title: "Onay ve yayın operasyonu", body: "Tasarımlar ve metinler onaya sunulur, ardından düzenli yayın ve kontrol süreci işler." },
        { title: "Veri okuma ve optimizasyon", body: "Hangi içerik türünün daha çok etkileşim, DM veya lead ürettiği analiz edilerek sonraki ay optimize edilir." },
      ],
      spotlightTitle: "Neden logolu görünüm önemli?",
      spotlightBody: "Sosyal medya hizmeti, doğrudan Instagram, Facebook, LinkedIn ve TikTok gibi platformlarla çalıştığı için bu sayfada platform görünürlüğü güven, netlik ve profesyonel algı üretir.",
      ctaTitle: "Markanızın sosyal görünümünü güçlendirelim",
      ctaBody: "İçerik planı, tasarım kalitesi, platform seçimi ve görünürlük stratejisini birlikte netleştirelim. Dağınık sosyal medya yerine yönetilen bir sistem kuralım.",
      ctaButton: "İçerik Planı Talep Edin",
      contentTitle: "Hizmet Kapsamı",
      gainsTitle: "Bu Hizmetle Neler Kazanırsınız?",
      faqTitle: "Sıkça Sorulan Sorular",
      faqIntro: "Platform seçimi, içerik süreci ve reklam desteğiyle ilgili en çok sorulanlar.",
    },
    en: {
      heroLabel: "Social Growth System",
      sectionLabel: "Service Detail",
      platformsLabel: "Core platforms",
      platforms: [
        { label: "Instagram", key: "instagram" },
        { label: "Facebook", key: "facebook" },
        { label: "LinkedIn" },
        { label: "TikTok" },
        { label: "WhatsApp", key: "whatsapp" },
      ],
      stats: [
        { value: "Monthly", label: "Content discipline", detail: "A predictable publishing system replaces random posting." },
        { value: "Brand", label: "Consistent voice", detail: "Visual language, copy style, and CTA logic stay aligned across content." },
        { value: "Reach", label: "Organic + paid harmony", detail: "Content is shaped to support both visibility and ad creative needs." },
      ],
      deliverablesTitle: "What we build in this service",
      deliverables: [
        "Monthly content calendar and publishing roadmap",
        "Instagram and Facebook visual series and carousel concepts",
        "Reels / short-form video ideas and copy direction",
        "Story flow, engagement structure, and DM direction",
        "Alignment between organic content and Meta ad creatives",
        "Monthly performance review and next-month content direction",
      ],
      workflowTitle: "How we approach social management",
      workflowIntro: "For us, social media is not random posting. It is a structured communication system that supports trust and demand.",
      workflow: [
        { title: "Audience and brand voice review", body: "We define tone, message priorities, and what each platform should do for the brand." },
        { title: "Series planning and creative framework", body: "We shape recurring content formats, design logic, and the balance between awareness and response." },
        { title: "Approval and publishing operations", body: "Designs and captions are reviewed, then moved into a consistent publishing rhythm." },
        { title: "Performance reading and refinement", body: "We evaluate which content drives stronger reach, DMs, engagement, or enquiries, then improve the next cycle." },
      ],
      spotlightTitle: "Why platform logos matter here",
      spotlightBody: "This service is directly tied to Instagram, Facebook, LinkedIn, and TikTok. Showing those platforms clearly creates stronger trust and faster comprehension.",
      ctaTitle: "Let’s strengthen your social presence",
      ctaBody: "We can define the right content structure, platform focus, and visual system together so your brand stops posting randomly and starts communicating strategically.",
      ctaButton: "Request a Content Plan",
      contentTitle: "Scope of Service",
      gainsTitle: "What You Gain With This Service",
      faqTitle: "Frequently Asked Questions",
      faqIntro: "The most common questions around platforms, workflow, and paid support.",
    },
  },
  "marka-kimligi-ve-grafik-tasarim": {
    tr: {
      heroLabel: "Marka Sistemi",
      sectionLabel: "Hizmet Detayı",
      platformsLabel: "Çıktı alanları",
      platforms: [
        { label: "Logo System" },
        { label: "Typography" },
        { label: "Color Direction" },
        { label: "Social Kit" },
        { label: "Brand Guide" },
      ],
      stats: [
        { value: "Logo", label: "Tanınabilirlik", detail: "Sadece güzel değil, hatırlanabilir ve farklılaşan bir yön kurulur." },
        { value: "Guide", label: "Kullanım disiplini", detail: "Marka farklı yüzeylerde dağılmadan uygulanabilir hale gelir." },
        { value: "Kit", label: "Dijital hazır", detail: "Sosyal medya, web ve sunum tarafı için uygulanabilir şablonlar üretilir." },
      ],
      deliverablesTitle: "Teslimat yapısı",
      deliverables: [
        "Logo yönleri, sembol varyasyonları ve kullanım kombinasyonları",
        "Renk paleti, tipografi sistemi ve görsel ritim",
        "Marka kullanım rehberi ve temel yasak / doğru kullanım örnekleri",
        "Sosyal medya kapak, post ve sunum şablonları",
        "Kartvizit, antet veya kurumsal doküman yönleri",
        "Dijital ve baskı için vektörel teslim dosyaları",
      ],
      workflowTitle: "Tasarım sürecimiz",
      workflowIntro: "Marka tasarımını sadece estetik kararlar dizisi olarak değil, işletmenin dijital görünüm standardı olarak ele alıyoruz.",
      workflow: [
        { title: "Marka konumunu anlama", body: "Sektör, hedef kitle, ton ve mevcut algı analiz edilerek görsel yönün stratejik zemini kurulur." },
        { title: "Görsel yön üretimi", body: "Logo eksenleri, renk evreni ve tipografik davranışlar üzerinden ayırt edici bir sistem geliştirilir." },
        { title: "Revizyon ve sistemleştirme", body: "Seçilen yön rafine edilir; farklı kullanım yüzeyleri için net ve uygulanabilir hale getirilir." },
        { title: "Teslim ve yaygınlaştırma", body: "Marka rehberi, dosya paketi ve uygulama örnekleriyle sistem ekip içinde kullanılabilir hale gelir." },
      ],
      spotlightTitle: "Güçlü marka neden satış etkiler?",
      spotlightBody: "Çünkü ilk güven, en çok görsel netlikten gelir. Markanın profesyonel görünmesi; teklifin, web sitesinin ve sosyal medyanın daha ciddi algılanmasını sağlar.",
      ctaTitle: "Markanızı daha net, daha güçlü, daha tutarlı gösterelim",
      ctaBody: "Yeni marka kuruyor ya da mevcut görünümünüzü modernize etmek istiyorsanız, kullanışlı ve güçlü bir kimlik sistemi tasarlayabiliriz.",
      ctaButton: "Marka Görüşmesi Talep Edin",
      contentTitle: "Hizmet Kapsamı",
      gainsTitle: "Bu Hizmetle Neler Kazanırsınız?",
      faqTitle: "Sıkça Sorulan Sorular",
      faqIntro: "Logo, teslim dosyaları ve marka sistemi hakkında merak edilenler.",
    },
    en: {
      heroLabel: "Brand System",
      sectionLabel: "Service Detail",
      platformsLabel: "Output areas",
      platforms: [
        { label: "Logo System" },
        { label: "Typography" },
        { label: "Color Direction" },
        { label: "Social Kit" },
        { label: "Brand Guide" },
      ],
      stats: [
        { value: "Logo", label: "Recognition", detail: "The goal is not just to look nice, but to become identifiable and distinctive." },
        { value: "Guide", label: "Usage discipline", detail: "The brand becomes consistent across different digital and print surfaces." },
        { value: "Kit", label: "Digital ready", detail: "Social, web, and presentation templates make implementation easier." },
      ],
      deliverablesTitle: "Delivery structure",
      deliverables: [
        "Logo directions, symbol variations, and usage combinations",
        "Colour palette, typography system, and visual rhythm",
        "Brand usage guide with correct / incorrect examples",
        "Templates for social media, presentations, and cover graphics",
        "Business card, letterhead, and basic corporate material directions",
        "Vector and export-ready files for digital and print use",
      ],
      workflowTitle: "Our design process",
      workflowIntro: "We approach brand design as a visual standard for the business, not only as a set of aesthetic decisions.",
      workflow: [
        { title: "Understanding position", body: "We assess the sector, audience, tone, and current perception before moving into visuals." },
        { title: "Visual direction creation", body: "Logo axes, colour atmosphere, and typographic behaviour are developed into a coherent identity." },
        { title: "Refinement and system building", body: "The selected direction is refined and adapted for practical use across real surfaces." },
        { title: "Delivery and rollout", body: "Guidelines, file packages, and application examples help the brand become usable across teams." },
      ],
      spotlightTitle: "Why strong branding affects sales",
      spotlightBody: "Because trust begins visually. A clearer, more professional identity makes the website, proposal, and social media feel more credible.",
      ctaTitle: "Let’s make your brand clearer, stronger, and more consistent",
      ctaBody: "Whether you are starting from zero or modernising an existing identity, we can build a usable and memorable brand system.",
      ctaButton: "Request a Brand Review",
      contentTitle: "Scope of Service",
      gainsTitle: "What You Gain With This Service",
      faqTitle: "Frequently Asked Questions",
      faqIntro: "The most common questions around logos, delivery files, and brand systems.",
    },
  },
  "dijital-strateji-ve-pazarlama": {
    tr: {
      heroLabel: "Büyüme Planı",
      sectionLabel: "Hizmet Detayı",
      platformsLabel: "Strateji araçları",
      platforms: [
        { label: "SEO" },
        { label: "GA4" },
        { label: "Search Console" },
        { label: "Landing Pages" },
        { label: "Offer Design" },
      ],
      stats: [
        { value: "Funnel", label: "Bütünsel bakış", detail: "Trafik, teklif, sayfa ve ölçüm ayrı ayrı değil, tek sistem olarak değerlendirilir." },
        { value: "ROI", label: "Önceliklendirme", detail: "Sınırlı bütçeyi hangi kanalda nasıl kullanmanız gerektiği netleşir." },
        { value: "Data", label: "Ölçülebilir karar", detail: "Varsayım yerine veriyle çalışan kanal ve sayfa kararları üretiriz." },
      ],
      deliverablesTitle: "Strateji kapsamında ele aldığımız başlıklar",
      deliverables: [
        "Kanal önceliği ve büyüme yol haritası",
        "SEO, içerik ve landing page uyum analizi",
        "CTA, teklif, form ve başvuru akışlarının gözden geçirilmesi",
        "Metrik seti, event yapısı ve dönüşüm mantığının tanımlanması",
        "Kampanya mesajı ile sayfa mesajı arasındaki boşlukların kapatılması",
        "Aylık strateji notları ve uygulama önerileri",
      ],
      workflowTitle: "Nasıl strateji kuruyoruz?",
      workflowIntro: "Bu hizmet, kampanya çalıştırmadan önce ya da kampanyalar çalışırken sistemi düzene sokmak için kullanılır.",
      workflow: [
        { title: "Mevcut durum analizi", body: "Sitenizi, teklif yapınızı, içerik dengenizi, reklam mantığınızı ve ölçüm eksiklerini değerlendiriyoruz." },
        { title: "Kanal ve mesaj önceliği", body: "Hangi kanalın hangi hedef için kullanılacağı, hangi mesajın hangi sayfaya akacağı netleştiriliyor." },
        { title: "Dönüşüm ve ölçüm tasarımı", body: "Lead, form, görüşme veya satış gibi kritik aksiyonların nasıl ölçüleceği ve optimize edileceği kuruluyor." },
        { title: "İyileştirme planı", body: "Uygulanabilir ve önceliklendirilmiş bir büyüme listesiyle sonraki sprintler için yol çiziyoruz." },
      ],
      spotlightTitle: "Bu hizmet neden kritiktir?",
      spotlightBody: "Çünkü birçok işletme reklam açıyor ama teklif, sayfa ve veri tarafını birlikte kurmadığı için bütçeyi verimsiz kullanıyor. Strateji bu dağınıklığı kapatır.",
      ctaTitle: "Dijital büyüme yol haritanızı birlikte çıkaralım",
      ctaBody: "SEO, içerik, teklif akışı ve reklam mantığı birbirine oturmuyorsa önce stratejiyi netleştirelim. Böylece sonraki uygulamalar çok daha verimli ilerler.",
      ctaButton: "Strateji Görüşmesi Alın",
      contentTitle: "Hizmet Kapsamı",
      gainsTitle: "Bu Hizmetle Neler Kazanırsınız?",
      faqTitle: "Sıkça Sorulan Sorular",
      faqIntro: "SEO, kanal seçimi ve büyüme mimarisiyle ilgili en çok sorulanlar.",
    },
    en: {
      heroLabel: "Growth Blueprint",
      sectionLabel: "Service Detail",
      platformsLabel: "Strategy tools",
      platforms: [
        { label: "SEO" },
        { label: "GA4" },
        { label: "Search Console" },
        { label: "Landing Pages" },
        { label: "Offer Design" },
      ],
      stats: [
        { value: "Funnel", label: "System view", detail: "Traffic, pages, offers, and measurement are reviewed as one system." },
        { value: "ROI", label: "Prioritisation", detail: "We define where budget and effort should go first." },
        { value: "Data", label: "Measurable decisions", detail: "Channel and page decisions are based on data, not assumptions." },
      ],
      deliverablesTitle: "What this strategy service covers",
      deliverables: [
        "Channel priority and growth roadmap",
        "SEO, content, and landing page alignment review",
        "CTA, offer, form, and enquiry flow analysis",
        "Metric set, event structure, and conversion logic definition",
        "Closing the gap between campaign message and page message",
        "Monthly strategic notes and implementation direction",
      ],
      workflowTitle: "How we build strategy",
      workflowIntro: "This service is used to bring order before campaigns start, or to fix the system while campaigns are already running.",
      workflow: [
        { title: "Current-state analysis", body: "We review the site, offer structure, content balance, ad logic, and measurement gaps." },
        { title: "Channel and message priorities", body: "We define which channel should serve which goal, and where each message should lead." },
        { title: "Conversion and tracking design", body: "We shape how key actions such as leads, forms, calls, or sales will be measured and improved." },
        { title: "Improvement roadmap", body: "We turn findings into a prioritised growth list that can be executed step by step." },
      ],
      spotlightTitle: "Why this service matters",
      spotlightBody: "Many businesses run campaigns without aligning the offer, page structure, and measurement system. Strategy closes that costly gap.",
      ctaTitle: "Let’s define your digital growth roadmap",
      ctaBody: "If SEO, content, offers, and advertising are not working as one system yet, we can fix the structure before more budget is spent.",
      ctaButton: "Book a Strategy Call",
      contentTitle: "Scope of Service",
      gainsTitle: "What You Gain With This Service",
      faqTitle: "Frequently Asked Questions",
      faqIntro: "Common questions around SEO, prioritisation, and growth architecture.",
    },
  },
  "google-ads-ve-meta-pixel-reklam-yonetimi": {
    tr: {
      heroLabel: "Performans Reklamı",
      sectionLabel: "Hizmet Detayı",
      platformsLabel: "Reklam ve ölçüm araçları",
      platforms: [
        { label: "Google Ads", key: "google-ads" },
        { label: "Meta Pixel", key: "meta" },
        { label: "GA4" },
        { label: "GTM" },
        { label: "Remarketing" },
      ],
      stats: [
        { value: "Ads", label: "Kampanya yönetimi", detail: "Google ve Meta tarafında net kampanya yapısı ve düzenli optimizasyon kurulur." },
        { value: "Pixel", label: "Dönüşüm takibi", detail: "Form, telefon, trial ve satış aksiyonları görünür hale gelir." },
        { value: "ROAS", label: "Bütçe okuması", detail: "Harcanan bütçenin hangi kitlede ve hangi mesajda daha iyi çalıştığı anlaşılır." },
      ],
      deliverablesTitle: "Bu hizmette neler var?",
      deliverables: [
        "Google Ads kampanya mimarisi, reklam grupları ve anahtar kelime mantığı",
        "Meta reklam hesabı, Pixel kurulumu ve event eşlemesi",
        "Google Tag Manager ile dönüşüm, tıklama ve form takip kurulumu",
        "GA4 entegrasyonu ve reklam kaynaklarının ölçüm görünürlüğü",
        "Remarketing zemini, audience segmenti ve temel dönüşüm optimizasyonu",
        "Aylık raporlama, bütçe yorumu ve aksiyon önerileri",
      ],
      workflowTitle: "Reklam yönetimini nasıl yürütüyoruz?",
      workflowIntro: "Sadece kampanya açmak yerine, reklam hesabını landing page ve ölçüm sistemiyle birlikte çalışır hale getiriyoruz.",
      workflow: [
        { title: "Kurulum ve veri doğrulama", body: "Hesap yapısı, Pixel, GTM, GA4 ve dönüşüm eventleri eksiksiz şekilde kuruluyor veya düzeltiliyor." },
        { title: "Kampanya ve kreatif eşleşmesi", body: "Google Ads ve Meta tarafında doğru teklif, doğru hedefleme ve doğru sayfa eşleşmesi kuruluyor." },
        { title: "Optimizasyon ve test", body: "Bütçe dağılımı, reklam mesajı, hedef kitle ve dönüşüm kalitesi düzenli testlerle iyileştiriliyor." },
        { title: "Raporlama ve sonraki aksiyon", body: "Sadece maliyet değil; hangi kampanyanın gerçek başvuru ve satış kalitesi ürettiği yorumlanıyor." },
      ],
      spotlightTitle: "Neden logolu görünüm bu sayfada kritik?",
      spotlightBody: "Bu hizmet doğrudan Google Ads ve Meta Pixel altyapısına dayanır. Kullanıcının sayfaya gelir gelmez bu platformları görmesi, hizmetin kapsamını saniyeler içinde netleştirir.",
      ctaTitle: "Reklam hesabınızı ölçülebilir hale getirelim",
      ctaBody: "Google Ads, Meta Pixel, GTM ve Analytics altyapınız kopuksa reklam bütçesi doğru okunmaz. Hesabınızı ölçülebilir ve optimize edilebilir hale getirebiliriz.",
      ctaButton: "Reklam Altyapısı Analizi İsteyin",
      contentTitle: "Hizmet Kapsamı",
      gainsTitle: "Bu Hizmetle Neler Kazanırsınız?",
      faqTitle: "Sıkça Sorulan Sorular",
      faqIntro: "Google Ads, Meta Pixel ve ölçüm altyapısı hakkında en çok sorulan sorular.",
    },
    en: {
      heroLabel: "Performance Advertising",
      sectionLabel: "Service Detail",
      platformsLabel: "Advertising and tracking tools",
      platforms: [
        { label: "Google Ads", key: "google-ads" },
        { label: "Meta Pixel", key: "meta" },
        { label: "GA4" },
        { label: "GTM" },
        { label: "Remarketing" },
      ],
      stats: [
        { value: "Ads", label: "Campaign management", detail: "Google and Meta campaigns are structured clearly and optimised continuously." },
        { value: "Pixel", label: "Conversion visibility", detail: "Forms, calls, trials, and purchases become trackable and usable." },
        { value: "ROAS", label: "Budget clarity", detail: "You can see which message, audience, and campaign structure is performing best." },
      ],
      deliverablesTitle: "What is included?",
      deliverables: [
        "Google Ads campaign architecture, ad groups, and keyword logic",
        "Meta ad account setup, Pixel implementation, and event mapping",
        "Google Tag Manager tracking for conversions, forms, and clicks",
        "GA4 integration and source-level visibility across campaigns",
        "Remarketing foundations, audience segmentation, and conversion optimisation",
        "Monthly reporting, budget interpretation, and action recommendations",
      ],
      workflowTitle: "How we manage advertising",
      workflowIntro: "We do not only launch campaigns. We make the ad account, landing page, and measurement layer work together.",
      workflow: [
        { title: "Setup and tracking validation", body: "Account structure, Pixel, GTM, GA4, and conversion events are built or corrected properly." },
        { title: "Campaign and creative alignment", body: "Google Ads and Meta campaigns are aligned with the right offer, targeting, and landing page." },
        { title: "Optimisation and testing", body: "Budget allocation, messaging, audiences, and conversion quality are improved through structured iteration." },
        { title: "Reporting and next actions", body: "We interpret not only cost metrics, but which campaigns are creating better real-world lead or sales quality." },
      ],
      spotlightTitle: "Why logo visibility matters on this page",
      spotlightBody: "This service is directly built around Google Ads and Meta Pixel. Showing those platforms immediately helps visitors understand the exact scope and increases trust.",
      ctaTitle: "Let’s make your ad account measurable",
      ctaBody: "If Google Ads, Meta Pixel, GTM, and Analytics are disconnected, your ad budget cannot be interpreted properly. We can turn that into a measurable system.",
      ctaButton: "Request an Ad Setup Audit",
      contentTitle: "Scope of Service",
      gainsTitle: "What You Gain With This Service",
      faqTitle: "Frequently Asked Questions",
      faqIntro: "Common questions around Google Ads, Meta Pixel, and measurement setup.",
    },
  },
};
