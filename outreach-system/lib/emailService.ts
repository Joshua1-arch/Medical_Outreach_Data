import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "missing_key");

// ---------------------------------------------------------------------------
// Shared layout helpers (Matching precisely with lib/email.ts format)
// ---------------------------------------------------------------------------
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const LOGO_URL = `${BASE_URL}/Reachside1.png`;
const YEAR = new Date().getFullYear();

export const emailHeader = () => `
    <div style="background-color:#000000; padding:28px 40px; text-align:center;">
        <img src="${LOGO_URL}" alt="ReachPoint" width="160" height="auto"
             style="display:inline-block; max-width:160px; height:auto;" />
    </div>
    <div style="background-color:#fbbf38; height:4px;"></div>
`;

export const emailFooter = (extra = '') => `
    <div style="background-color:#f5f5f5; border-top:1px solid #e0e0e0; padding:24px 40px; text-align:center;">
        ${extra ? `<p style="margin:0 0 8px; color:#555555; font-size:13px;">${extra}</p>` : ''}
        <p style="margin:0; color:#999999; font-size:12px; letter-spacing:0.3px;">
            &copy; ${YEAR} ReachPoint Medical Outreach. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#bbbbbb; font-size:11px;">
            This is an automated notification. Please do not reply to this message.
        </p>
    </div>
`;

export const emailWrapper = (headerHtml: string, bodyHtml: string, footerExtra = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ReachPoint</title>
</head>
<body style="margin:0; padding:0; background-color:#ebebeb; font-family:'Segoe UI', Arial, sans-serif; color:#1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ebebeb; padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                       style="max-width:600px; width:100%; background-color:#ffffff;
                              border-radius:8px; overflow:hidden;
                              box-shadow:0 2px 12px rgba(0,0,0,0.12);">
                    <tr><td>${headerHtml}</td></tr>
                    <tr><td style="padding:36px 40px;">${bodyHtml}</td></tr>
                    <tr><td>${emailFooter(footerExtra)}</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const ctaButton = (href: string, label: string) => `
    <div style="text-align:center; margin:28px 0;">
        <a href="${href}"
           style="display:inline-block; background-color:#fbbf38; color:#000000;
                  text-decoration:none; font-weight:700; font-size:14px;
                  letter-spacing:0.5px; padding:13px 36px; border-radius:4px;">
            ${label}
        </a>
    </div>
`;

export const infoBlock = (borderColor: string, bgColor: string, content: string) => `
    <div style="border-left:4px solid ${borderColor}; background-color:${bgColor};
                padding:16px 20px; border-radius:0 4px 4px 0; margin:20px 0;">
        ${content}
    </div>
`;

export const divider = () => `<hr style="border:none; border-top:1px solid #e8e8e8; margin:24px 0;" />`;

export const h2 = (text: string, color = '#000000') =>
    `<h2 style="margin:0 0 16px; font-size:20px; font-weight:700; color:${color};">${text}</h2>`;

export const p = (text: string, style = '') =>
    `<p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333; ${style}">${text}</p>`;

export async function sendOutreachEmail(to: string, subject: string, htmlBody: string) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || 'ReachPoint';

    if (!apiKey || !senderEmail) {
        console.warn('BREVO_API_KEY or BREVO_SENDER_EMAIL not configured');
        return { success: false, message: 'Brevo credentials not configured' };
    }

    // Automatically apply the sleek Brevo HTML wrapper format if the user passed raw content
    const isAlreadyWrapped = htmlBody.includes('<html') || htmlBody.includes('<!DOCTYPE html>');
    const finalHtml = isAlreadyWrapped ? htmlBody : emailWrapper(emailHeader(), htmlBody);

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: finalHtml,
                textContent: finalHtml.replace(/<[^>]*>/g, '') // Basic text fallback
            })
        });

        // Check for rate limit (429), quota issues (402, 403), or server errors (5xx)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            const isRateLimitOrQuota = response.status === 429 || response.status === 402 || response.status === 403;
            const isAuthError = response.status === 401;
            const isServerError = response.status >= 500;

            if (isRateLimitOrQuota || isServerError || isAuthError) {
                throw new Error(`Brevo failure: Status ${response.status} - ${JSON.stringify(errorData)}`);
            }
            
            // For other Brevo errors (like 400 Bad Request regarding invalid emails), do not failover because Resend would fail too.
            console.error('Brevo API validation/content error:', errorData);
            return { success: false, message: 'Failed to send email via Brevo (Validation/Content)' };
        }

        const data = await response.json();
        return { success: true, message: 'Email sent successfully via Brevo', messageId: data.messageId, provider: 'brevo' };

    } catch (error: any) {
        // This catch block handles network errors/timeouts from fetch, or the intentional quota/rate-limit throws above.
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isNetworkOrDeliveryFailure = errorMessage.includes('Brevo failure') || errorMessage.includes('fetch') || errorMessage.includes('network') || error.cause !== undefined;

        if (isNetworkOrDeliveryFailure) {
            console.warn("Brevo failed, falling back to Resend...", errorMessage);
            
            try {
                if (!process.env.RESEND_API_KEY) {
                    console.warn('RESEND_API_KEY not configured, cannot execute fallback');
                    return { success: false, message: 'Failed to send email via Resend (No API Key)' };
                }

                // Execute the fallback logic using resend.emails.send() with the exact same payload
                const { data, error: resendError } = await resend.emails.send({
                    from: `${senderName} <${senderEmail}>`, // Note: Ensure senderEmail domain is verified in Resend dashboard
                    to: [to],
                    subject: subject,
                    html: finalHtml,
                    text: finalHtml.replace(/<[^>]*>/g, '')
                });

                if (resendError) {
                    console.error("Resend API Error during failover:", resendError);
                    return { success: false, message: 'Failed to send email via Resend fallback' };
                }

                return { success: true, message: 'Email sent successfully via Resend failover', messageId: data?.id, provider: 'resend' };
            } catch (resendFallbackError) {
                console.error('Resend fallback exception:', resendFallbackError);
                return { success: false, message: 'Failed to send email after fallback attempted' };
            }
        }
        
        console.error('Unexpected email sending exception:', error);
        return { success: false, message: 'Unexpected failed to send email' };
    }
}
