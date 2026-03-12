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

/* ── Password reset email ──────────────────────────────────────────────── */

export interface PasswordResetMailPayload {
    toEmail: string;
    resetLink: string;
    locale: "tr" | "en";
}

/**
 * Sends a password reset email. Never throws.
 * - When SMTP is not configured: logs reset link to console in dev, returns silently.
 * - When SMTP send fails: logs error, in dev also logs reset link, returns silently.
 * - Auth routes must never fail due to mail; this function is safe to call without try/catch.
 */
export async function sendPasswordResetEmail(data: PasswordResetMailPayload): Promise<void> {
  try {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port     = Number(process.env.SMTP_PORT ?? 587);
    const secure   = process.env.SMTP_SECURE === "true";
    const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "no-reply@zygsoft.com";

    const isDev = process.env.NODE_ENV !== "production";
    const forceLog = process.env.FORCE_DEV_RESET_LOG === "true";

    const logResetLink = () => {
        if (isDev || forceLog) {
            console.log("\n[ZYGSOFT] ─── Password reset link ───");
            console.log("To:", data.toEmail);
            console.log("Reset link:", data.resetLink);
            console.log("────────────────────────────────────────────────────────\n");
        }
    };

    if (!host || !user || !pass) {
        logResetLink();
        if (!isDev) {
            console.warn("[mail] SMTP not configured — password reset email skipped.");
        }
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });

        const subject = data.locale === "tr"
            ? "ZYGSOFT — Şifre Sıfırlama"
            : "ZYGSOFT — Password Reset";

        const html = data.locale === "tr"
        ? `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Şifre Sıfırlama</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">Şifre sıfırlama talebiniz alındı. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi oluşturabilirsiniz.</p>
          <p style="margin:0 0 24px;font-size:13px;color:#6b7280">Bu bağlantı 1 saat içinde geçerliliğini yitirecektir.</p>
          <a href="${data.resetLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">Şifre Sıfırla</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">Bu e-postayı siz talep etmediyseniz güvenle yok sayabilirsiniz.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Password Reset</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">We received your password reset request. Click the link below to create a new password.</p>
          <p style="margin:0 0 24px;font-size:13px;color:#6b7280">This link will expire in 1 hour.</p>
          <a href="${data.resetLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">Reset Password</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">If you did not request this, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await transporter.sendMail({
            from: `"ZYGSOFT" <${fromEmail}>`,
            to: data.toEmail,
            subject,
            html,
        });
    } catch (err) {
        console.error("[mail] Password reset email send failed:", err);
        if (err instanceof Error) {
            console.error("[mail] Error message:", err.message);
            console.error("[mail] Stack:", err.stack);
        }
        logResetLink();
    }
  } catch (outerErr) {
    console.error("[mail] sendPasswordResetEmail unexpected error:", outerErr);
    if (process.env.NODE_ENV !== "production" || process.env.FORCE_DEV_RESET_LOG === "true") {
      console.log("\n[ZYGSOFT] ─── Password reset link (fallback) ───");
      console.log("To:", data.toEmail);
      console.log("Reset link:", data.resetLink);
      console.log("────────────────────────────────────────────────────────\n");
    }
  }
}

/* ── Verification email ──────────────────────────────────────────────── */

export interface VerificationMailPayload {
  toEmail: string;
  verifyLink: string;
  locale: "tr" | "en";
}

export async function sendVerificationEmail(data: VerificationMailPayload): Promise<void> {
  try {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE === "true";
    const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "no-reply@zygsoft.com";

    const isDev = process.env.NODE_ENV !== "production";
    const forceLog = process.env.FORCE_DEV_RESET_LOG === "true";

    const logVerifyLink = () => {
      if (isDev || forceLog) {
        console.log("\n[ZYGSOFT] ─── Email verification link ───");
        console.log("To:", data.toEmail);
        console.log("Verify link:", data.verifyLink);
        console.log("────────────────────────────────────────────────────────\n");
      }
    };

    if (!host || !user || !pass) {
      logVerifyLink();
      if (!isDev) {
        console.warn("[mail] SMTP not configured — verification email skipped.");
      }
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });

      const subject = data.locale === "tr"
        ? "Email adresinizi doğrulayın"
        : "Verify your email address";

      const html = data.locale === "tr"
        ? `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">E-posta Doğrulama</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">Hesabınızı oluşturdunuz. E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın.</p>
          <p style="margin:0 0 24px;font-size:13px;color:#6b7280">Bu bağlantı 24 saat içinde geçerliliğini yitirecektir.</p>
          <a href="${data.verifyLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">E-postamı Doğrula</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">ZYGSOFT — Bu mesaj otomatik olarak gönderilmiştir. Panel: <a href="${process.env.NEXTAUTH_URL || "https://zygsoft.com"}/dashboard" style="color:#e6c800">Panel</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Email Verification</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">You created an account. Click the link below to verify your email address.</p>
          <p style="margin:0 0 24px;font-size:13px;color:#6b7280">This link will expire in 24 hours.</p>
          <a href="${data.verifyLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">Verify My Email</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">ZYGSOFT — This message was sent automatically. Dashboard: <a href="${process.env.NEXTAUTH_URL || "https://zygsoft.com"}/dashboard" style="color:#e6c800">Dashboard</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: `"ZYGSOFT" <${fromEmail}>`,
        to: data.toEmail,
        subject,
        html,
      });
    } catch (err) {
      console.error("[mail] Verification email send failed:", err);
      logVerifyLink();
    }
  } catch (outerErr) {
    console.error("[mail] sendVerificationEmail unexpected error:", outerErr);
    if (process.env.NODE_ENV !== "production" || process.env.FORCE_DEV_RESET_LOG === "true") {
      console.log("\n[ZYGSOFT] ─── Verification link (fallback) ───");
      console.log("To:", data.toEmail);
      console.log("Verify link:", data.verifyLink);
      console.log("────────────────────────────────────────────────────────\n");
    }
  }
}

/* ── Support ticket created email ─────────────────────────────────────── */

export interface SupportTicketCreatedMailPayload {
  toEmail: string;
  ticketCode: string;
  subject: string;
  createdAt: Date;
  panelLink: string;
  locale: "tr" | "en";
}

export async function sendSupportTicketCreatedEmail(data: SupportTicketCreatedMailPayload): Promise<void> {
  try {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE === "true";
    const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "no-reply@zygsoft.com";

    const isDev = process.env.NODE_ENV !== "production";
    const dateStr = new Intl.DateTimeFormat(data.locale === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(data.createdAt);

    const logFallback = () => {
      if (isDev) {
        console.log("\n[ZYGSOFT] ─── Support ticket created (SMTP not configured) ───");
        console.log("To:", data.toEmail, "| Ticket:", data.ticketCode, "| Subject:", data.subject);
        console.log("────────────────────────────────────────────────────────\n");
      }
    };

    if (!host || !user || !pass) {
      logFallback();
      return;
    }

    try {
      const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

      const subject = data.locale === "tr"
        ? `Destek talebiniz oluşturuldu | #${data.ticketCode}`
        : `Your support ticket has been created | #${data.ticketCode}`;

      const html = data.locale === "tr"
        ? `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Destek Talebi Oluşturuldu</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">Destek talebiniz başarıyla oluşturuldu.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px">
            <tr><td style="font-size:12px;color:#6b7280;font-weight:600">Talep No</td><td style="font-size:14px;color:#111827;font-weight:700">#${data.ticketCode}</td></tr>
            <tr><td style="font-size:12px;color:#6b7280;font-weight:600;padding-top:8px">Konu</td><td style="font-size:14px;color:#111827;padding-top:8px">${data.subject}</td></tr>
            <tr><td style="font-size:12px;color:#6b7280;font-weight:600;padding-top:8px">Tarih</td><td style="font-size:14px;color:#111827;padding-top:8px">${dateStr}</td></tr>
          </table>
          <a href="${data.panelLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">Talebi Görüntüle</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">ZYGSOFT — Bu mesaj otomatik olarak gönderilmiştir.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Support Ticket Created</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">Your support ticket has been created successfully.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px">
            <tr><td style="font-size:12px;color:#6b7280;font-weight:600">Ticket No</td><td style="font-size:14px;color:#111827;font-weight:700">#${data.ticketCode}</td></tr>
            <tr><td style="font-size:12px;color:#6b7280;font-weight:600;padding-top:8px">Subject</td><td style="font-size:14px;color:#111827;padding-top:8px">${data.subject}</td></tr>
            <tr><td style="font-size:12px;color:#6b7280;font-weight:600;padding-top:8px">Date</td><td style="font-size:14px;color:#111827;padding-top:8px">${dateStr}</td></tr>
          </table>
          <a href="${data.panelLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">View Ticket</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">ZYGSOFT — This message was sent automatically.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: `"ZYGSOFT" <${fromEmail}>`,
        to: data.toEmail,
        subject,
        html,
      });
    } catch (err) {
      console.error("[mail] Support ticket created email send failed:", err);
      logFallback();
    }
  } catch (outerErr) {
    console.error("[mail] sendSupportTicketCreatedEmail unexpected error:", outerErr);
  }
}

/* ── Support ticket reply email ───────────────────────────────────────── */

export interface SupportTicketReplyMailPayload {
  toEmail: string;
  ticketCode: string;
  subject: string;
  adminReply: string;
  panelLink: string;
  locale: "tr" | "en";
}

export async function sendSupportTicketReplyEmail(data: SupportTicketReplyMailPayload): Promise<void> {
  try {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE === "true";
    const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "no-reply@zygsoft.com";

    const isDev = process.env.NODE_ENV !== "production";

    const logFallback = () => {
      if (isDev) {
        console.log("\n[ZYGSOFT] ─── Support ticket reply (SMTP not configured) ───");
        console.log("To:", data.toEmail, "| Ticket:", data.ticketCode);
        console.log("────────────────────────────────────────────────────────\n");
      }
    };

    if (!host || !user || !pass) {
      logFallback();
      return;
    }

    try {
      const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

      const subject = data.locale === "tr"
        ? `Destek talebiniz yanıtlandı | #${data.ticketCode}`
        : `Your support ticket has been answered | #${data.ticketCode}`;

      const replyHtml = data.adminReply
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

      const html = data.locale === "tr"
        ? `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Destek Talebi Yanıtı</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">Destek talebinize yanıt verildi.</p>
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-weight:600">Talep No: #${data.ticketCode} — ${data.subject}</p>
          <div style="margin:16px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
            <p style="margin:0;font-size:14px;color:#111827;line-height:1.7">${replyHtml}</p>
          </div>
          <a href="${data.panelLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">Talebi Görüntüle</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">ZYGSOFT — Bu mesaj otomatik olarak gönderilmiştir.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0e0e0e;padding:28px 32px">
          <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.02em">ZYG<span style="color:#e6c800">SOFT</span></span>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em">Support Ticket Reply</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6">Your support ticket has been answered.</p>
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-weight:600">Ticket No: #${data.ticketCode} — ${data.subject}</p>
          <div style="margin:16px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px">
            <p style="margin:0;font-size:14px;color:#111827;line-height:1.7">${replyHtml}</p>
          </div>
          <a href="${data.panelLink}" style="display:inline-block;background:#e6c800;color:#0e0e0e;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px">View Ticket</a>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">ZYGSOFT — This message was sent automatically.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: `"ZYGSOFT" <${fromEmail}>`,
        to: data.toEmail,
        subject,
        html,
      });
    } catch (err) {
      console.error("[mail] Support ticket reply email send failed:", err);
      logFallback();
    }
  } catch (outerErr) {
    console.error("[mail] sendSupportTicketReplyEmail unexpected error:", outerErr);
  }
}
