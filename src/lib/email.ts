import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

type Mail = { to: string; subject: string; heading: string; body: string[]; cta?: { label: string; url: string } };

let transporter: Transporter | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  transporter = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      })
    : null;
  return transporter;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function renderHtml({ heading, body, cta }: Mail) {
  const paragraphs = body.map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#334155">${escapeHtml(p)}</p>`).join("");
  const button = cta
    ? `<a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">${escapeHtml(cta.label)}</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f5f5fb;font-family:Inter,Segoe UI,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;padding:32px">
<tr><td><p style="margin:0 0 24px;font-weight:800;font-size:20px;color:#4f46e5">ReadnLearn</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">${escapeHtml(heading)}</h1>${paragraphs}${button}
<p style="margin:32px 0 0;font-size:12px;color:#94a3b8">You're receiving this because of activity on your ReadnLearn account.</p>
</td></tr></table></td></tr></table></body></html>`;
}

export async function sendMail(mail: Mail) {
  const transport = getTransporter();
  const text = [mail.heading, "", ...mail.body, ...(mail.cta ? ["", `${mail.cta.label}: ${mail.cta.url}`] : [])].join("\n");
  if (!transport) {
    console.info(`\n[email:dev] To: ${mail.to}\n[email:dev] Subject: ${mail.subject}\n${text}\n`);
    return;
  }
  try {
    await transport.sendMail({ from: process.env.EMAIL_FROM, to: mail.to, subject: mail.subject, text, html: renderHtml(mail) });
  } catch (error) {
    console.error("[email] send failed", { to: mail.to, subject: mail.subject, error });
  }
}

const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

export const emails = {
  signupPendingAdmin: (user: { name: string; email: string; role: string }) => {
    const to = process.env.ADMIN_NOTIFY_EMAIL;
    if (!to) {
      console.info(`[email:dev] New ${user.role} signup pending approval: ${user.email}`);
      return Promise.resolve();
    }
    const role = user.role === "tutor" ? "Tutor" : "Student";
    return sendMail({
      to,
      subject: `New ${role} signup pending approval`,
      heading: `New ${role} signup pending approval`,
      body: [`${user.name} (${user.email}) just signed up as a ${role.toLowerCase()} and is waiting for review.`],
      cta: { label: "Review pending accounts", url: `${appUrl()}/admin` },
    });
  },
  accountApproved: (user: { name: string; email: string }) =>
    sendMail({
      to: user.email,
      subject: "Your ReadnLearn account is approved 🎉",
      heading: `Welcome aboard, ${user.name.split(" ")[0]}!`,
      body: ["Great news: your account has been approved. You can now log in and start learning."],
      cta: { label: "Log in to ReadnLearn", url: `${appUrl()}/login` },
    }),
  accountRejected: (user: { name: string; email: string }) =>
    sendMail({
      to: user.email,
      subject: "Update on your ReadnLearn account",
      heading: "We couldn't approve your account",
      body: [
        `Hi ${user.name.split(" ")[0]}, after reviewing your signup we weren't able to approve your account at this time.`,
        "If you think this was a mistake, please reach out through our contact page and we'll take another look.",
      ],
      cta: { label: "Contact support", url: `${appUrl()}/contact` },
    }),
  passwordResetCode: (user: { name: string; email: string }, code: string) =>
    sendMail({
      to: user.email,
      subject: `Your ReadnLearn reset code: ${code}`,
      heading: "Reset your password",
      body: [`Your 6-digit code is ${code}.`, "It expires in 15 minutes and can be used once. If you didn't request this, you can safely ignore this email."],
    }),
  contactMessage: (message: { name: string; email: string; subject: string; message: string }) =>
    sendMail({
      to: process.env.ADMIN_NOTIFY_EMAIL || "support@readnlearn.com",
      subject: `[Contact] ${message.subject}`,
      heading: message.subject,
      body: [`From: ${message.name} <${message.email}>`, message.message],
    }),
};
