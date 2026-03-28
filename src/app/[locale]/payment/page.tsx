"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PaymentCheckout } from "@/components/payment/PaymentCheckout";

export default function PaymentPage() {
    return (
        <div className="min-h-screen bg-[#fafafc] font-sans">
            <Header />
            <main className="flex-1 pt-28 pb-24 md:pt-32">
                <div className="container mx-auto max-w-7xl px-6">
                    <PaymentCheckout />
                </div>
            </main>
            <Footer />
        </div>
    );
}
