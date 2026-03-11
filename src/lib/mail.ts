import nodemailer from "nodemailer";

export interface ContactMailPayload {
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    createdAt: Date;
}

/**
 * Sends a contact-form notification email to the configured recipient.
 *
 * Returns silently (with a console warning) when SMTP credentials are not
 * configured so the caller never has to handle "unconfigured" as an error.
 *
 * Throws only on genuine send failures so the caller can decide whether to
 * surface that or simply log it.
 */
export async function sendContactNotification(data: ContactMailPayload): Promise<void> {
    const host     = process.env.SMTP_HOST;
    const user     = process.env.SMTP_USER;
    const pass     = process.env.SMTP_PASS;
    const port     = Number(process.env.SMTP_PORT ?? 587);
    const secure   = process.env.SMTP_SECURE === "true";
    const toEmail  = process.env.CONTACT_TO_EMAIL  ?? "info@zygsoft.com";
    const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "no-reply@zygsoft.com";

    if (!host || !user || !pass) {
        console.warn("[mail] SMTP is not configured — skipping contact notification email. Set SMTP_HOST, SMTP_USER and SMTP_PASS in your environment.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });

    const dateStr = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        day:    "2-digit",
        month:  "long",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit",
    }).format(data.createdAt);

    const html = buildHtml(data, dateStr);
    const text = buildText(data, dateStr);

    await transporter.sendMail({
        from:    `"ZYGSOFT Web" <${fromEmail}>`,
        to:      toEmail,
        subject: `[ZYGSOFT] Yeni İletişim Talebi — ${data.name}`,
        html,
        text,
    });
}

/* ── Email templates ────────────────────────────────────────────── */

function row(label: string, value: string | null | undefined): string {
    if (!value) return "";
    return `
        <tr>
            <td style="padding:8px 16px 8px 0;font-size:13px;color:#6b7280;font-weight:600;white-space:nowrap;vertical-align:top">${label}</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;vertical-align:top">${value.replace(/\n/g, "<br>")}</td>
        </tr>`;
}

function buildHtml(d: ContactMailPayload, dateStr: string): string {
    return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">

        <!-- Header -->
        <tr>
          <td style="background:#0e0e0e;padding:28px 32px">
            <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
            <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Yeni İletişim Talebi</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row("Ad Soyad", d.name)}
              ${row("E-posta",  d.email)}
              ${row("Telefon",  d.phone)}
              ${row("Konu",     d.subject)}
              ${row("Tarih",    dateStr)}
            </table>

            <!-- Message box -->
            <div style="margin-top:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280">Mesaj</p>
              <p style="margin:0;font-size:14px;color:#111827;line-height:1.7;white-space:pre-wrap">${d.message}</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">Bu e-posta ZYGSOFT web formu tarafından otomatik olarak gönderilmiştir. Yanıtlamak için gönderenin e-posta adresini kullanın.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildText(d: ContactMailPayload, dateStr: string): string {
    const lines: string[] = [
        "ZYGSOFT — Yeni İletişim Talebi",
        "=".repeat(40),
        `Ad Soyad : ${d.name}`,
        `E-posta  : ${d.email}`,
    ];
    if (d.phone)   lines.push(`Telefon  : ${d.phone}`);
    if (d.subject) lines.push(`Konu     : ${d.subject}`);
    lines.push(`Tarih    : ${dateStr}`);
    lines.push("", "-".repeat(40), "Mesaj:", "", d.message, "", "-".repeat(40));
    lines.push("Bu e-posta ZYGSOFT web formu tarafından otomatik olarak gönderilmiştir.");
    return lines.join("\n");
}
