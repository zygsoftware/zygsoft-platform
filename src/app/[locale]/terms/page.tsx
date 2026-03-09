"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";

const sections = [
    {
        title: "1. Taraflar ve Kapsam",
        content: `Bu Kullanıcı Sözleşmesi ("Sözleşme"), ZYGSOFT Yazılım & Danışmanlık ("Zygsoft" veya "Şirket") ile Zygsoft platformuna kayıt olan gerçek kişi ("Kullanıcı") arasında akdedilmektedir. Kayıt işleminin tamamlanmasıyla Kullanıcı bu Sözleşme'nin tüm hükümlerini okuduğunu, anladığını ve kabul ettiğini beyan eder.`,
    },
    {
        title: "2. Hizmetlerin Kapsamı",
        content: `Zygsoft; web yazılımı geliştirme, dijital strateji danışmanlığı, hukuki yazılım araçları (UDF dönüştürücü, OCR, AI özet, KVKK sansürleme, e-imza) ve sosyal medya yönetim hizmetleri sunmaktadır. Sunulan hizmetler, Zygsoft'un takdirine bağlı olarak değiştirilebilir veya genişletilebilir.`,
    },
    {
        title: "3. Hesap Oluşturma ve Güvenlik",
        content: `• Kullanıcı, hesap oluştururken doğru ve güncel bilgi vermekle yükümlüdür.
• Hesap güvenliğinin korunması Kullanıcı'nın sorumluluğundadır.
• Hesap bilgilerinin üçüncü şahıslarla paylaşılması yasaktır.
• Güvenlik ihlali durumunda Kullanıcı derhal info@zygsoft.com adresine bildirimde bulunmalıdır.
• Zygsoft, yetkisiz kullanım kaynaklı zararlardan sorumlu tutulamaz.`,
    },
    {
        title: "4. Abonelik ve Ödeme Koşulları",
        content: `• Ücretli hizmetler için belirlenen abonelik bedeli, seçilen süre boyunca geçerlidir.
• Ödeme Havale/EFT yöntemiyle yapılır; dekont panelden yüklenerek bildirilir.
• Yönetici tarafından onaylanan ödemeler 24 saat içinde aktive edilir.
• Ödemeler iade edilmez; hizmet iptali durumunda kalan süre kullanılabilir.
• Zygsoft fiyatlandırmayı değiştirme hakkını saklı tutar; değişiklikler 30 gün önceden duyurulur.`,
    },
    {
        title: "5. Kullanım Koşulları ve Yasaklar",
        content: `Kullanıcı şu eylemlerde bulunmamayı kabul eder:
• Platforma zarar verecek yazılım, algoritma veya kod çalıştırmak
• Fikri mülkiyet haklarını ihlal etmek
• Yasadışı veya kötü niyetli amaçlarla platform kullanmak
• Başkalarının kişisel verilerini izinsiz işlemek
• Platformun kaynak kodunu tersine mühendislikle çözmeye çalışmak
Bu koşulların ihlali durumunda hesap askıya alınabilir veya silinebilir.`,
    },
    {
        title: "6. Fikri Mülkiyet",
        content: `Platform üzerindeki tüm içerik, tasarım, yazılım ve marka unsurları Zygsoft'a aittir. Kullanıcılar platforma yükledikleri içeriklerin telif haklarından kendileri sorumludur. Zygsoft, yüklenen belgeleri yalnızca hizmetin sunulması amacıyla kullanır; üçüncü taraflarla paylaşmaz.`,
    },
    {
        title: "7. Sorumluluk Sınırlaması",
        content: `Zygsoft; hizmet kesintileri, veri kayıpları veya dolaylı zararlardan azami yasal sınırlar dahilinde sorumludur. Platform "olduğu gibi" sunulmakta olup %99.5 uptime hedeflenmekle birlikte garanti edilmemektedir. Bakım süreçleri önceden duyurulur.`,
    },
    {
        title: "8. Sözleşmenin Feshi",
        content: `Kullanıcı istediği zaman hesabını silebilir. Zygsoft, bu Sözleşme'yi ihlal eden kullanıcıların hesaplarını önceden bildirmeksizin askıya alabilir veya silebilir. Hesap silme işleminden sonra veriler 30 gün içinde kalıcı olarak silinir.`,
    },
    {
        title: "9. Uygulanacak Hukuk",
        content: `Bu Sözleşme Türk Hukuku'na tabidir. Sözleşmeden doğabilecek uyuşmazlıklarda Antalya Mahkemeleri ve İcra Müdürlükleri yetkilidir.\n\nBu metin en son 05.03.2025 tarihinde güncellenmiştir.`,
    },
];

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="flex-1 flex flex-col bg-[#070710]">
                {/* Hero */}
                <section className="relative pt-32 pb-16 overflow-hidden mesh-hero grid-bg">
                    <div className="orb orb-accent w-[500px] h-[500px] -top-32 -right-32 opacity-20" />
                    <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-6 mx-auto">
                                <ScrollText size={32} />
                            </div>
                            <span className="section-eyebrow text-violet-400">Yasal</span>
                            <h1 className="section-title text-4xl md:text-5xl mb-4">Kullanıcı Sözleşmesi</h1>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto">Zygsoft platformunu kullanarak bu sözleşmenin tüm koşullarını kabul etmiş sayılırsınız.</p>
                        </motion.div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#070710] to-transparent" />
                </section>

                {/* Content */}
                <section className="py-16 bg-[#070710]">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="space-y-6">
                            {sections.map((section, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-8 rounded-2xl"
                                >
                                    <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="text-violet-400">{section.title.split(".")[0]}.</span>
                                        {section.title.split(".").slice(1).join(".")}
                                    </h2>
                                    <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
