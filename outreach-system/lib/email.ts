import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Transporter
// ---------------------------------------------------------------------------
const createTransporter = () => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return null;
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
    });
};

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions) {
    try {
        const transporter = createTransporter();
        if (!transporter) {
            return { success: false, message: 'Email credentials not configured', skipped: true };
        }
        const info = await transporter.sendMail({
            from: `"ReachPoint" <${process.env.GMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, '')
        });
        return { success: true, message: 'Email sent successfully', messageId: info.messageId };
    } catch {
        return { success: false, message: 'Failed to send email' };
    }
}

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const LOGO_URL = `${BASE_URL}/Reach.png`;
const YEAR = new Date().getFullYear();

/** Top header strip with logo */
const emailHeader = () => `
    <div style="background-color:#000000; padding:28px 40px; text-align:center;">
        <img src="${LOGO_URL}" alt="ReachPoint" width="160" height="auto"
             style="display:inline-block; max-width:160px; height:auto;" />
    </div>
    <div style="background-color:#fbbf38; height:4px;"></div>
`;

/** Bottom footer strip */
const emailFooter = (extra = '') => `
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

/** Outer wrapper for the full email */
const emailWrapper = (headerHtml: string, bodyHtml: string, footerExtra = '') => `
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

/** Gold CTA button */
const ctaButton = (href: string, label: string) => `
    <div style="text-align:center; margin:28px 0;">
        <a href="${href}"
           style="display:inline-block; background-color:#fbbf38; color:#000000;
                  text-decoration:none; font-weight:700; font-size:14px;
                  letter-spacing:0.5px; padding:13px 36px; border-radius:4px;">
            ${label}
        </a>
    </div>
`;

/** Highlighted info block */
const infoBlock = (borderColor: string, bgColor: string, content: string) => `
    <div style="border-left:4px solid ${borderColor}; background-color:${bgColor};
                padding:16px 20px; border-radius:0 4px 4px 0; margin:20px 0;">
        ${content}
    </div>
`;

const divider = () => `<hr style="border:none; border-top:1px solid #e8e8e8; margin:24px 0;" />`;

const h2 = (text: string, color = '#000000') =>
    `<h2 style="margin:0 0 16px; font-size:20px; font-weight:700; color:${color};">${text}</h2>`;

const p = (text: string, style = '') =>
    `<p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#333333; ${style}">${text}</p>`;

// ---------------------------------------------------------------------------
// 1. User Approval Email
// ---------------------------------------------------------------------------
export async function sendUserApprovalEmail(userEmail: string, userName: string) {
    const loginUrl = `${BASE_URL}/login`;

    const body = `
        ${h2('Account Approved')}
        ${p(`Dear <strong>${userName}</strong>,`)}
        ${p('We are pleased to inform you that your ReachPoint account has been reviewed and approved by our administrator.')}
        ${p('You now have full access to the platform and may begin creating outreach events, managing participant records, and contributing to our mission.')}
        ${divider()}
        ${ctaButton(loginUrl, 'Access Your Account')}
        ${p('If you have any questions or require assistance, please contact your system administrator.', 'font-size:13px; color:#666666;')}
    `;

    return sendEmail({
        to: userEmail,
        subject: 'Account Approved - ReachPoint',
        html: emailWrapper(emailHeader(), body, 'For support, contact your system administrator.'),
        text: `Dear ${userName}, your ReachPoint account has been approved. Login at ${loginUrl}`
    });
}

// ---------------------------------------------------------------------------
// 2. User Rejection Email
// ---------------------------------------------------------------------------
export async function sendUserRejectionEmail(userEmail: string, userName: string) {
    const body = `
        ${h2('Registration Update')}
        ${p(`Dear <strong>${userName}</strong>,`)}
        ${p('Thank you for your interest in the ReachPoint platform. After reviewing your registration, we regret to inform you that your account application could not be approved at this time.')}
        ${infoBlock('#fbbf38', '#fffbeb',
            `<p style="margin:0; font-size:14px; color:#333333;">This decision may be due to incomplete information, unmet membership criteria, or current organisational requirements.</p>`
        )}
        ${p('If you believe this decision was made in error or would like further information, please reach out directly to your system administrator.')}
        ${p('We appreciate your understanding.', 'font-size:13px; color:#666666;')}
    `;

    return sendEmail({
        to: userEmail,
        subject: 'Registration Update - ReachPoint',
        html: emailWrapper(emailHeader(), body),
        text: `Dear ${userName}, your ReachPoint registration could not be approved. Please contact the administrator for more information.`
    });
}

// ---------------------------------------------------------------------------
// 3. Welcome Email (invitation code sign-up)
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail(userEmail: string, userName: string) {
    const loginUrl = `${BASE_URL}/login`;

    const features = [
        ['Instant Access', 'Your account is active immediately with no approval wait time.'],
        ['Trusted Creator Status', 'Your events are automatically approved upon submission.'],
        ['Full Platform Access', 'Create events, manage records, and capture participant data right away.'],
    ];

    const featureRows = features.map(([title, desc]) => `
        <tr>
            <td style="padding:12px 0; border-bottom:1px solid #f0f0f0; vertical-align:top;">
                <p style="margin:0; font-size:14px; font-weight:700; color:#000000;">${title}</p>
                <p style="margin:4px 0 0; font-size:13px; color:#555555;">${desc}</p>
            </td>
        </tr>
    `).join('');

    const body = `
        ${h2('Welcome to ReachPoint')}
        ${p(`Dear <strong>${userName}</strong>,`)}
        ${p('You have successfully registered on the ReachPoint platform using an invitation code. Your account is now active and ready to use.')}
        ${divider()}
        <p style="margin:0 0 12px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#999999;">Your Privileges</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;">
            ${featureRows}
        </table>
        ${ctaButton(loginUrl, 'Log In to Your Account')}
        ${p('If you have any questions, do not hesitate to contact your administrator.', 'font-size:13px; color:#666666;')}
    `;

    return sendEmail({
        to: userEmail,
        subject: 'Welcome to ReachPoint - Your Account is Active',
        html: emailWrapper(emailHeader(), body),
        text: `Dear ${userName}, your ReachPoint account is now active with Trusted Creator privileges. Login at ${loginUrl}`
    });
}

// ---------------------------------------------------------------------------
// 4. Event Approval Email
// ---------------------------------------------------------------------------
export async function sendEventApprovalEmail(userEmail: string, userName: string, eventTitle: string) {
    const eventsUrl = `${BASE_URL}/events`;

    const body = `
        ${h2('Event Approved')}
        ${p(`Dear <strong>${userName}</strong>,`)}
        ${p('We are pleased to confirm that your submitted event has been reviewed and approved. It is now live on the platform.')}
        ${infoBlock('#fbbf38', '#fffbeb',
            `<p style="margin:0 0 4px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#999999;">Approved Event</p>
             <p style="margin:0; font-size:16px; font-weight:700; color:#000000;">${eventTitle}</p>
             <p style="margin:6px 0 0; font-size:13px; color:#555555;">This event is now visible to all platform users and ready for participation.</p>`
        )}
        ${p('You may now track participant registrations, manage records, and view event data through your dashboard.')}
        ${ctaButton(eventsUrl, 'View Event on Platform')}
    `;

    return sendEmail({
        to: userEmail,
        subject: `Event Approved: ${eventTitle} - ReachPoint`,
        html: emailWrapper(emailHeader(), body),
        text: `Dear ${userName}, your event "${eventTitle}" has been approved and is now live. View it at ${eventsUrl}`
    });
}

// ---------------------------------------------------------------------------
// 5. Event Rejection Email
// ---------------------------------------------------------------------------
export async function sendEventRejectionEmail(userEmail: string, userName: string, eventTitle: string) {
    const createUrl = `${BASE_URL}/dashboard/create-event`;

    const reasons = [
        'Event details require clarification or modification',
        'Scheduling conflict with an existing event',
        'Submission does not align with current organisational objectives',
        'Insufficient planning or resource information provided',
    ];

    const reasonList = reasons.map(r => `<li style="margin-bottom:6px; font-size:14px; color:#444444;">${r}</li>`).join('');

    const body = `
        ${h2('Event Submission Update')}
        ${p(`Dear <strong>${userName}</strong>,`)}
        ${p('Thank you for submitting your event to the ReachPoint platform. After careful review, we regret to inform you that the following submission could not be approved at this time.')}
        ${infoBlock('#e0e0e0', '#f9f9f9',
            `<p style="margin:0 0 4px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#999999;">Submitted Event</p>
             <p style="margin:0; font-size:15px; font-weight:700; color:#000000;">${eventTitle}</p>`
        )}
        <p style="margin:0 0 10px; font-size:14px; font-weight:700; color:#333333;">Common reasons for non-approval include:</p>
        <ul style="margin:0 0 20px; padding-left:20px;">
            ${reasonList}
        </ul>
        ${p('We encourage you to review your submission, make any necessary adjustments, and resubmit. You may also contact the administrator for specific feedback.')}
        ${ctaButton(createUrl, 'Submit a New Event')}
        ${p('We value your commitment to the outreach mission and look forward to your next submission.', 'font-size:13px; color:#666666;')}
    `;

    return sendEmail({
        to: userEmail,
        subject: `Event Submission Update: ${eventTitle} - ReachPoint`,
        html: emailWrapper(emailHeader(), body),
        text: `Dear ${userName}, your event "${eventTitle}" could not be approved. Please revise and resubmit, or contact the administrator for feedback.`
    });
}
