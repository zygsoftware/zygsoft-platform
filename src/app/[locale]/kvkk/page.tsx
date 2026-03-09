"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, FileText } from "lucide-react";

const sections = [
    {
        title: "1. Veri Sorumlusu",
        content: `Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca hazırlanmıştır. Veri sorumlusu sıfatıyla ZYGSOFT Yazılım & Danışmanlık ("Zygsoft"), Antalya, Türkiye adresinde mukim olup kişisel verilerinizi işlemektedir.`,
    },
    {
        title: "2. İşlenen Kişisel Veriler",
        content: `Hizmetlerimizden yararlanmanız kapsamında aşağıdaki kişisel veriler işlenebilir:
• Ad, soyad ve iletişim bilgileri (e-posta, telefon)
• Şirket / büro adı ve unvan bilgileri
• Hesap giriş bilgileri (şifrelenmiş)
• Ödeme bildirimi ve dekont bilgileri
• Platform kullanım verileri (log, oturum bilgileri)
• Yüklenen belgeler (hukuk yazılımı kullanıcıları için)`,
    },
    {
        title: "3. Kişisel Verilerin İşlenme Amacı",
        content: `Kişisel verileriniz şu amaçlarla işlenmektedir:
• Hesap oluşturma ve kimlik doğrulama
• Abonelik ve ödeme yönetimi
• Satın alınan hizmetlerin aktivasyonu
• Müşteri destek hizmetlerinin yürütülmesi
• Yasal yükümlülüklerin yerine getirilmesi
• Hizmet kalitesinin artırılması ve sistem güvenliğinin sağlanması`,
    },
    {
        title: "4. Kişisel Verilerin Aktarılması",
        content: `Kişisel verileriniz; yasal zorunluluklar dışında üçüncü taraflarla paylaşılmamaktadır. Ödeme işlemlerine ilişkin veriler, güvenli ödeme altyapısı sağlayıcıları ile sınırlı ölçüde paylaşılabilir. Yurt dışı veri transferi yapılmamaktadır.`,
    },
    {
        title: "5. Kişisel Verilerin Saklanma Süresi",
        content: `Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte veya ilgili mevzuatta öngörülen yasal saklama süresi sonunda silinmekte, yok edilmekte veya anonim hale getirilmektedir. Hesap silme talebi halinde veriler 30 gün içinde silinir.`,
    },
    {
        title: "6. Kişisel Veri Sahibinin Hakları",
        content: `KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde/yurt dışında aktarıldığı üçüncü kişileri öğrenme
• Eksik veya yanlış işlenmişse düzeltilmesini isteme
• Silinmesini veya yok edilmesini isteme
• İşlemenin otomatik sistemler vasıtasıyla gerçekleştirilmesi durumunda ortaya çıkabilecek aleyhte sonuca itiraz etme
• Zararın giderilmesini talep etme`,
    },
    {
        title: "7. Veri Güvenliği",
        content: `Kişisel verileriniz, endüstri standardı güvenlik önlemleri (SSL/TLS şifrelemesi, güvenlik duvarları, şifreli veritabanı) ile korunmaktadır. Yüklenen hukuki belgeler sunucu tarafında işlendikten sonra otomatik olarak imha edilmektedir.`,
    },
    {
        title: "8. İletişim",
        content: `KVKK kapsamındaki taleplerinizi info@zygsoft.com adresine e-posta ile iletebilirsiniz. Talepleriniz en geç 30 gün içinde yanıtlanacaktır.\n\nBu metin en son 05.03.2025 tarihinde güncellenmiştir.`,
    },
];

export default function KvkkPage() {
    return (
        <>
            <Header />
            <main className="flex-1 flex flex-col bg-[#070710]">
                {/* Hero */}
                <section className="relative pt-32 pb-16 overflow-hidden mesh-hero grid-bg">
                    <div className="orb orb-brand w-[500px] h-[500px] -top-32 -left-32 opacity-25" />
                    <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 mx-auto">
                                <Shield size={32} />
                            </div>
                            <span className="section-eyebrow">Gizlilik</span>
                            <h1 className="section-title text-4xl md:text-5xl mb-4">KVKK Aydınlatma Metni</h1>
                            <p className="text-slate-400 text-lg max-w-xl mx-auto">Kişisel verileriniz Zygsoft tarafından 6698 sayılı KVKK kapsamında güvence altına alınmaktadır.</p>
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
                                        <span className="text-emerald-400">{section.title.split(".")[0]}.</span>
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
