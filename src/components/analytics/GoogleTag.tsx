import Script from "next/script";

/**
 * Google etiketleme — ortam değişkenlerinden biri dolu olmalı.
 *
 * 1) **Google Tag Manager** (tercih edilen): Tek konteynerde GA4, Google Ads, dönüşüm vb.
 *    `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`
 *
 * 2) **Sadece GA4 (gtag.js):** GTM kullanmıyorsanız
 *    `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
 *
 * İkisi birden tanımlıysa öncelik GTM'dedir.
 */
export function GoogleTag() {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

    if (gtmId) {
        return (
            <>
                <Script id="google-tag-manager" strategy="afterInteractive">
                    {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
                </Script>
                <noscript>
                    <iframe
                        title="Google Tag Manager"
                        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                        height={0}
                        width={0}
                        style={{ display: "none", visibility: "hidden" }}
                    />
                </noscript>
            </>
        );
    }

    if (gaId) {
        return (
            <>
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                    strategy="afterInteractive"
                />
                <Script id="google-analytics-ga4" strategy="afterInteractive">
                    {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');
`}
                </Script>
            </>
        );
    }

    return null;
}
