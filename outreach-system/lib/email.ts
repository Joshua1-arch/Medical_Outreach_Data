import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    // Check if email credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn('Email credentials not configured. Emails will not be sent.');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });
};

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using Gmail SMTP
 * @param options - Email configuration (to, subject, html, text)
 * @returns Promise with success status and message
 */
export async function sendEmail(options: EmailOptions) {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.log('Email not sent: Credentials not configured');
            return {
                success: false,
                message: 'Email credentials not configured',
                skipped: true
            };
        }

        const info = await transporter.sendMail({
            from: `"Outreach System" <${process.env.GMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
        });

        console.log('Email sent:', info.messageId);
        return { success: true, message: 'Email sent successfully', messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, message: 'Failed to send email', error };
    }
}

/**
 * Send user approval email
 */
export async function sendUserApprovalEmail(userEmail: string, userName: string) {
    const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fbbf24; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }
                .button { display: inline-block; padding: 12px 30px; background: #1e293b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🎉 Account Approved!</h1>
                </div>
                <div class="content">
                    <h2 style="color: #1e293b;">Welcome, ${userName}!</h2>
                    <p>Great news! Your account has been approved by our administrator.</p>
                    <p>You can now access the Outreach Management System and start creating events, managing records, and contributing to our mission.</p>
                    <div style="text-align: center;">
                        <a href="${loginUrl}/login" class="button">Login Now</a>
                    </div>
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                        If you have any questions, please don't hesitate to reach out to your administrator.
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from the Outreach Management System.</p>
                    <p>© ${new Date().getFullYear()} Outreach System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: '✅ Your Account Has Been Approved!',
        html,
        text: `Welcome ${userName}! Your account has been approved. Login now at ${loginUrl}/login`
    });
}

/**
 * Send user rejection email
 */
export async function sendUserRejectionEmail(userEmail: string, userName: string) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }
                .info-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">Registration Update</h1>
                </div>
                <div class="content">
                    <h2 style="color: #dc2626;">Hello ${userName},</h2>
                    <p>Thank you for your interest in the Outreach Management System.</p>
                    <div class="info-box">
                        <p style="margin: 0; color: #991b1b; font-weight: bold;">
                            Unfortunately, your registration could not be approved at this time.
                        </p>
                    </div>
                    <p>This decision may be due to:</p>
                    <ul style="color: #475569;">
                        <li>Incomplete or insufficient information</li>
                        <li>Not meeting our current membership criteria</li>
                        <li>Administrative or organizational requirements</li>
                    </ul>
                    <p style="margin-top: 20px;">If you believe this was an error or would like more information, please contact the system administrator.</p>
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                        We appreciate your understanding.
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from the Outreach Management System.</p>
                    <p>© ${new Date().getFullYear()} Outreach System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: 'Registration Update - Outreach System',
        html,
        text: `Hello ${userName}, Thank you for your interest in the Outreach Management System. Unfortunately, your registration could not be approved at this time. Please contact the administrator for more information.`
    });
}

/**
 * Send welcome email to users who sign up with invitation codes
 */
export async function sendWelcomeEmail(userEmail: string, userName: string) {
    const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }
                .badge { display: inline-block; background: #fbbf24; color: #1e293b; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin: 10px 0; }
                .feature-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 30px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 10px 10px; }
           </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🎊 Welcome to the Team!</h1>
                </div>
                <div class="content">
                    <h2 style="color: #059669;">Congratulations, ${userName}!</h2>
                    <p>You've successfully signed up using an invitation code. Your account is now <strong>active</strong> and ready to use!</p>
                    
                    <div class="badge">✨ TRUSTED CREATOR STATUS</div>
                    
                    <p style="color: #047857; font-weight: bold;">You've been granted special privileges:</p>
                    
                    <div class="feature-box">
                        <p style="margin: 0; color: #065f46;"><strong>✓ Instant Access</strong> - No approval wait time</p>
                    </div>
                    <div class="feature-box">
                        <p style="margin: 0; color: #065f46;"><strong>✓ Trusted Creator</strong> - Your events are auto-approved</p>
                    </div>
                    <div class="feature-box">
                        <p style="margin: 0; color: #065f46;"><strong>✓ Full System Access</strong> - Create events and manage records immediately</p>
                    </div>
                    
                    <p style="margin-top: 20px;">You can now:</p>
                    <ul style="color: #475569;">
                        <li>Login to your account</li>
                        <li>Create outreach events</li>
                        <li>Manage participant records</li>
                        <li>Track blood donation data</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="${loginUrl}/login" class="button">Login to Your Account</a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                        Welcome aboard! If you have any questions, don't hesitate to reach out.
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from the Outreach Management System.</p>
                    <p>© ${new Date().getFullYear()} Outreach System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: '🎊 Welcome! Your Account is Active',
        html,
        text: `Welcome ${userName}! You've successfully signed up with an invitation code. Your account is active with Trusted Creator privileges. Login now at ${loginUrl}/login`
    });
}

/**
 * Send event approval email
 */
export async function sendEventApprovalEmail(userEmail: string, userName: string, eventTitle: string) {
    const eventsUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/events`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }
                .event-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 30px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🚀 Outreach Event Approved!</h1>
                </div>
                <div class="content">
                    <h2 style="color: #059669;">Congratulations, ${userName}!</h2>
                    <p>Your outreach event has been approved and is now live on the system.</p>
                    <div class="event-box">
                        <h3 style="margin: 0 0 10px 0; color: #047857;">📅 ${eventTitle}</h3>
                        <p style="margin: 0; color: #065f46;">Your event is now visible to all users and ready for participation.</p>
                    </div>
                    <p>You can now:</p>
                    <ul style="color: #475569;">
                        <li>View your event on the events page</li>
                        <li>Track participant registrations</li>
                        <li>Manage event records and data</li>
                    </ul>
                    <div style="text-align: center;">
                        <a href="${eventsUrl}" class="button">View Event</a>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated message from the Outreach Management System.</p>
                    <p>© ${new Date().getFullYear()} Outreach System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: `🎉 Your Event "${eventTitle}" is Now Live!`,
        html,
        text: `Congratulations ${userName}! Your outreach event "${eventTitle}" has been approved and is now live. View it at ${eventsUrl}`
    });
}

/**
 * Send event rejection email
 */
export async function sendEventRejectionEmail(userEmail: string, userName: string, eventTitle: string) {
    const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }
                .event-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .info-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .button { display: inline-block; padding: 12px 30px; background: #1e293b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">Event Submission Update</h1>
                </div>
                <div class="content">
                    <h2 style="color: #ea580c;">Hello ${userName},</h2>
                    <p>Thank you for submitting your outreach event to our system.</p>
                    <div class="event-box">
                        <h3 style="margin: 0 0 10px 0; color: #c2410c;">📅 ${eventTitle}</h3>
                    </div>
                    <div class="info-box">
                        <p style="margin: 0; color: #991b1b; font-weight: bold;">
                            Unfortunately, this event could not be approved at this time.
                        </p>
                    </div>
                    <p>Common reasons for event non-approval include:</p>
                    <ul style="color: #475569;">
                        <li>Event details need clarification or modification</li>
                        <li>Scheduling conflicts with existing events</li>
                        <li>Does not align with current organizational goals</li>
                        <li>Insufficient planning or resources indicated</li>
                    </ul>
                    <p style="margin-top: 20px;"><strong>What you can do:</strong></p>
                    <ul style="color: #475569;">
                        <li>Review and revise your event details</li>
                        <li>Submit a new event with additional information</li>
                        <li>Contact the administrator for specific feedback</li>
                    </ul>
                    <div style="text-align: center;">
                        <a href="${loginUrl}/events/create" class="button">Submit a New Event</a>
                    </div>
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                        We appreciate your commitment to our outreach mission. Don't be discouraged - we encourage you to try again!
                    </p>
                </div>
                <div class="footer">
                    <p>This is an automated message from the Outreach Management System.</p>
                    <p>© ${new Date().getFullYear()} Outreach System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: `Event Submission Update: "${eventTitle}"`,
        html,
        text: `Hello ${userName}, Thank you for submitting your event "${eventTitle}". Unfortunately, this event could not be approved at this time. You can revise and submit a new event or contact the administrator for feedback.`
    });
}
