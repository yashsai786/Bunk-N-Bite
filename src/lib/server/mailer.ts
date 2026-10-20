import nodemailer from "nodemailer";

export interface SendEmailPayload {
  to: string;
  subject: string;
  template: "welcome_existing" | "invite_new";
  universityName: string;
  studentName?: string | undefined;
  studentId?: string | undefined;
  department?: string | undefined;
  actionUrl: string;
}

/**
 * Send branded HTML email via Nodemailer using Gmail SMTP credentials from environment
 */
export async function sendMailViaNodemailer(payload: SendEmailPayload) {
  const user = process.env["SMTP_USER"] || "";
  const rawPass = process.env["SMTP_PASS"] || "";
  const pass = rawPass.replace(/\s+/g, "");

  if (!user || !pass) {
    console.warn("Nodemailer: SMTP_USER or SMTP_PASS is missing in environment.");
    return { success: false, error: "SMTP credentials not configured in .env" };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const isExisting = payload.template === "welcome_existing";
    const greetingName = payload.studentName?.trim() || "Student";
    const campusName = payload.universityName || "Campus";

    const htmlContent = isExisting
      ? `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 28px 32px; text-align: center; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; }
            .logo span { color: #f97316; }
            .content { padding: 32px; }
            .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
            h2 { margin-top: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
            p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
            .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; }
            .details-row { display: flex; justify-content: space-between; margin: 6px 0; }
            .details-label { color: #64748b; font-weight: 600; }
            .details-val { color: #0f172a; font-weight: 700; }
            .btn-wrapper { text-align: center; margin: 28px 0 16px; }
            .btn { display: inline-block; background: #f97316; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; }
            .footer { background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BUNK <span>N</span> BITE</div>
            </div>
            <div class="content">
              <div class="badge">Campus Membership Activated</div>
              <h2>Welcome to ${campusName}!</h2>
              <p>Hello <strong>${greetingName}</strong>,</p>
              <p>You have been enrolled into <strong>${campusName}</strong> on the BUNK N BITE campus dining platform.</p>
              <div class="details-card">
                <div class="details-row"><span class="details-label">Campus:</span> <span class="details-val">${campusName}</span></div>
                <div class="details-row"><span class="details-label">Student Email:</span> <span class="details-val">${payload.to}</span></div>
                ${payload.studentId ? `<div class="details-row"><span class="details-label">Student ID:</span> <span class="details-val">${payload.studentId}</span></div>` : ""}
              </div>
              <p>You can now order meals from campus canteens, skip long counters, and collect fresh food instantly using your existing account.</p>
              <div class="btn-wrapper">
                <a href="${payload.actionUrl}" class="btn">Open Campus Dashboard</a>
              </div>
            </div>
            <div class="footer">
              &copy; 2026 BUNK N BITE Multi-Campus Dining Platform. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 28px 32px; text-align: center; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; }
            .logo span { color: #f97316; }
            .content { padding: 32px; }
            .badge { display: inline-block; background: #ffedd5; color: #c2410c; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
            h2 { margin-top: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
            p { font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0; }
            .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; }
            .details-row { display: flex; justify-content: space-between; margin: 6px 0; }
            .details-label { color: #64748b; font-weight: 600; }
            .details-val { color: #0f172a; font-weight: 700; }
            .btn-wrapper { text-align: center; margin: 28px 0 16px; }
            .btn { display: inline-block; background: #f97316; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; }
            .note { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 20px; line-height: 1.5; }
            .footer { background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">BUNK <span>N</span> BITE</div>
            </div>
            <div class="content">
              <div class="badge">Official Campus Invitation</div>
              <h2>You've been invited to ${campusName}</h2>
              <p>Hello <strong>${greetingName}</strong>,</p>
              <p><strong>${campusName}</strong> has invited you to join the BUNK N BITE campus dining platform. Enjoy smart canteen pre-ordering and quick food pickup right from your smartphone.</p>
              <div class="details-card">
                <div class="details-row"><span class="details-label">Invited By:</span> <span class="details-val">${campusName}</span></div>
                <div class="details-row"><span class="details-label">Student Email:</span> <span class="details-val">${payload.to}</span></div>
                ${payload.studentId ? `<div class="details-row"><span class="details-label">Student ID:</span> <span class="details-val">${payload.studentId}</span></div>` : ""}
              </div>
              <div class="btn-wrapper">
                <a href="${payload.actionUrl}" class="btn">Accept Invitation & Join Campus</a>
              </div>
              <div class="note">
                <strong>Tip:</strong> This is a secure onboarding link. Click the button above to verify your account and activate your student dining profile.
              </div>
            </div>
            <div class="footer">
              &copy; 2026 BUNK N BITE Multi-Campus Dining Platform. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `;

    const info = await transporter.sendMail({
      from: `"BUNK N BITE Campus" <${user}>`,
      to: payload.to,
      subject: payload.subject,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Nodemailer dispatch error:", err);
    return { success: false, error: err?.message || "Failed to send email via SMTP" };
  }
}
