import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "Brainly <noreply@yourdomain.com>";

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Brainly</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="vertical-align:middle;">
              <!-- Brain icon SVG inline -->
              <span style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 12px;vertical-align:middle;">
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 18C32 18 24 16 20 20C16 24 15 28 16 32C17 36 18 39 20 41C22 43 26 44 28 43C30 42 32 40 32 40L32 18Z" fill="white" opacity="0.95"/>
                  <path d="M32 18C32 18 40 16 44 20C48 24 49 28 48 32C47 36 46 39 44 41C42 43 38 44 36 43C34 42 32 40 32 40L32 18Z" fill="white" opacity="0.85"/>
                  <rect x="30.5" y="18" width="3" height="22" rx="1.5" fill="white" opacity="0.6"/>
                  <path d="M20 41 Q26 48 32 47 Q38 48 44 41" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                </svg>
              </span>
              <span style="display:inline-block;vertical-align:middle;margin-left:12px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Brainly</span>
            </td></tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(99,102,241,0.08);">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 Brainly · Your Second Brain</p>
          <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">If you didn't request this email, you can safely ignore it.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── OTP Box component ────────────────────────────────────────────────────────
function otpBox(otp: string): string {
  const digits = otp.split("");
  const cells = digits.map(d =>
    `<td style="width:48px;height:56px;background:#f5f3ff;border:2px solid #e0e7ff;border-radius:10px;text-align:center;font-size:28px;font-weight:800;color:#6366f1;font-family:'Courier New',monospace;">${d}</td>`
  ).join('<td style="width:8px;"></td>');

  return `<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>${cells}</tr>
    </table>`;
}

// ─── 1. Welcome / Signup OTP ─────────────────────────────────────────────────
export async function sendVerificationEmail(email: string, fullName: string, otp: string) {
  const content = `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1f2937;">Welcome to Brainly! 🧠</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
        Hi <strong style="color:#374151;">${fullName}</strong>, thanks for signing up!<br/>
        Use the verification code below to activate your account.
      </p>

      <!-- OTP -->
      <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Your verification code</p>
        ${otpBox(otp)}
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">⏱ Expires in <strong>10 minutes</strong></p>
      </div>


      <div style="background:#eff6ff;border-left:3px solid #6366f1;border-radius:4px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.5;">
          🔒 <strong>Security tip:</strong> Never share this code with anyone. Brainly will never ask for your OTP.
        </p>
      </div>
    `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "🧠 Verify your Brainly account",
    html: emailWrapper(content),
  });
}

// ─── 2. Forgot Password OTP ───────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, otp: string) {
  const content = `
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1f2937;">Reset your password 🔐</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
        We received a request to reset the password for <strong style="color:#374151;">${email}</strong>.<br/>
        Enter the code below to proceed.
      </p>

      <!-- OTP -->
      <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Password reset code</p>
        ${otpBox(otp)}
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">⏱ Expires in <strong>10 minutes</strong></p>
      </div>

      <div style="background:#fff7ed;border-left:3px solid #f59e0b;border-radius:4px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.5;">
          ⚠️ <strong>Didn't request this?</strong> Your password has <em>not</em> been changed. You can safely ignore this email.
        </p>
      </div>
    `;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "🔐 Reset your Brainly password",
    html: emailWrapper(content),
  });
}
