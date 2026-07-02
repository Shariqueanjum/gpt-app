const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: 'WABCASH <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Email - WABCASH',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Your Email</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f4f5;">
            <tr>
              <td align="center" style="padding: 40px 16px;">
                
                <!-- Single White Card -->
                <table role="presentation" width="100%" max-width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background-color:#0f172a; padding:32px 24px;">
                      <span style="font-size:24px; font-weight:800; color:#ffffff; letter-spacing:1px;">WABCASH</span>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td align="center" style="padding:40px 32px 24px;">
                      <h1 style="margin:0 0 12px; font-size:22px; font-weight:700; color:#111827;">
                        Welcome to WABCASH! 🎉
                      </h1>
                      <p style="margin:0 0 28px; font-size:15px; line-height:1.6; color:#4b5563;">
                        Verify your email now by clicking the button below:
                      </p>

                      <!-- CTA -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 28px;">
                        <tr>
                          <td align="center" style="border-radius:8px; background-color:#5312bc;" bgcolor="#5312bc">
                            <a href="${verificationLink}" 
                               style="display:inline-block; padding:16px 40px; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:8px; letter-spacing:0.3px;">
                              VERIFY YOUR EMAIL
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Fallback -->
                      <p style="margin:0 0 6px; font-size:14px; font-weight:600; color:#111827;">
                        Can't see the button?
                      </p>
                      <p style="margin:0 0 24px; font-size:13px; line-height:1.5; color:#6b7280;">
                        Simply click or copy the link below in your browser:<br />
                        <a href="${verificationLink}" style="color:#2563eb; text-decoration:underline; word-break:break-all; font-size:13px;">
                          ${verificationLink}
                        </a>
                      </p>

                      <p style="margin:0 0 24px; font-size:13px; color:#9ca3af;">
                        This link will expire in 24 hours.
                      </p>
                    </td>
                  </tr>

                  <!-- Divider -->
                  <tr>
                    <td style="padding:0 32px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="border-top:1px solid #e5e7eb; font-size:0; line-height:0;">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding:20px 32px 32px;">
                      <p style="margin:0 0 6px; font-size:12px; color:#9ca3af; line-height:1.5;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                      <p style="margin:0; font-size:12px; color:#9ca3af;">
                        © ${new Date().getFullYear()} WABCASH. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
                <!-- /Single White Card -->

              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });
    console.log(`✅ Verification email sent to ${email}`);
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    throw new Error('Failed to send verification email. Please try again.');
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: 'WABCASH <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your Password - WABCASH',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Reset Password</title></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;">
            <tr><td align="center" style="padding:40px 16px;">
              <table style="max-width:560px;width:100%;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <tr><td align="center" style="background:#0f172a;padding:32px 24px;">
                  <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:1px;">WABCASH</span>
                </td></tr>
                <tr><td align="center" style="padding:40px 32px 24px;">
                  <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Reset Your Password</h1>
                  <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4b5563;">
                    Click the button below to reset your password. This link expires in 1 hour.
                  </p>
                  <table cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
                    <tr><td align="center" style="border-radius:8px;background:#10b981;">
                      <a href="${resetLink}" style="display:inline-block;padding:16px 40px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:8px;">
                        RESET PASSWORD
                      </a>
                    </td></tr>
                  </table>
                  <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td></tr>
                <tr><td align="center" style="padding:20px 32px 32px;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} WABCASH. All rights reserved.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (err) {
    console.error('❌ Password reset email failed:', err.message);
    throw new Error('Failed to send password reset email. Please try again.');
  }
};

const sendForgotUsernameEmail = async (email, username) => {
  try {
    await resend.emails.send({
      from: 'WABCASH <onboarding@resend.dev>',
      to: email,
      subject: 'Your WABCASH Username',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Your Username</title></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;">
            <tr><td align="center" style="padding:40px 16px;">
              <table style="max-width:560px;width:100%;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <tr><td align="center" style="background:#0f172a;padding:32px 24px;">
                  <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:1px;">WABCASH</span>
                </td></tr>
                <tr><td align="center" style="padding:40px 32px 24px;">
                  <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Your Username</h1>
                  <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4b5563;">
                    You requested a reminder of your username. Here it is:
                  </p>
                  <p style="margin:0 0 28px;font-size:24px;font-weight:700;color:#5312bc;letter-spacing:1px;">
                    ${username}
                  </p>
                  <p style="margin:0 0 24px;font-size:13px;color:#9ca3af;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td></tr>
                <tr><td align="center" style="padding:20px 32px 32px;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} WABCASH. All rights reserved.</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });
    console.log(`✅ Username reminder email sent to ${email}`);
  } catch (err) {
    console.error('❌ Username reminder email failed:', err.message);
    throw new Error('Failed to send username reminder email. Please try again.');
  }
};
module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendForgotUsernameEmail };