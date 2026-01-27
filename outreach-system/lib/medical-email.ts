import { sendEmail } from './email';

/**
 * Generate Medical Result HTML Template
 */
export function getMedicalResultTemplate(
    patientName: string,
    eventName: string,
    vitals: Record<string, string>,
    tests: Record<string, string>
) {
    // Helper to get reference ranges for common metrics
    const getReferenceRange = (testName: string) => {
        const lower = testName.toLowerCase();
        if (lower.includes('bp') || lower.includes('blood pressure')) return '90/60 - 120/80';
        if (lower.includes('malaria')) return 'Negative';
        if (lower.includes('bmi')) return '18.5 - 24.9';
        if (lower.includes('sugar') || lower.includes('glucose')) return '70 - 140 mg/dL';
        if (lower.includes('hiv')) return 'Non-Reactive';
        if (lower.includes('hepb')) return 'Negative';
        if (lower.includes('hepc')) return 'Negative';
        if (lower.includes('pulse') || lower.includes('heart rate')) return '60 - 100 bpm';
        if (lower.includes('temp')) return '36.1 - 37.2 °C';
        if (lower.includes('spo2')) return '> 95%';
        if (lower.includes('pcv') || lower.includes('hematocrit')) return '35% - 50%';
        return '-';
    };

    const createRows = (data: Record<string, string>) => {
        return Object.entries(data).map(([key, value]) => {
            // Skip empty values or internal fields or email/name
            if (!value || ['email', 'phone', 'name', 'gender', 'age', 'address'].includes(key.toLowerCase()) || key.startsWith('_')) return '';

            // Format key (camelCase to Title Case if needed, or just capitalize)
            // Replace underscores and hyphens with spaces, then title case
            // Also handle camelCase: 'bloodPressure' -> 'Blood Pressure'
            const label = key
                .replace(/([A-Z])/g, ' $1') // insert space before capital letters
                .replace(/[_-]/g, ' ') // replace _ and - with space
                .trim()
                .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

            const range = getReferenceRange(key);

            return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; color: #1e293b; font-weight: 500;">${label}</td>
                    <td style="padding: 12px; color: #334155; font-weight: bold;">${value}</td>
                    <td style="padding: 12px; color: #64748b; font-size: 13px;">${range}</td>
                </tr>
            `;
        }).join('');
    };

    // We combine vitals and tests into one list for the table, as requested example showed mixed data
    // Or we can keep them separate. The prompt example showed "Blood Pressure" (Vital) and "Malaria RDT" (Test) in the same table.
    // So merging is better.
    const allData = { ...vitals, ...tests };
    const rows = createRows(allData);

    if (!rows) {
        return `<div>No results to display.</div>`;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f1f5f9; }
                .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 30px; text-align: center; }
                .report-title { font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
                .report-subtitle { font-size: 14px; opacity: 0.8; margin-top: 5px; font-weight: 300; }
                .content { padding: 30px; }
                .greeting { font-size: 16px; margin-bottom: 20px; color: #334155; }
                .table-container { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px; }
                .table-header { background-color: #f8fafc; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                .table-header th { padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
                .disclaimer { font-style: italic; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="report-title">ReachPoint Medical Report</h1>
                    <div class="report-subtitle">Secure Patient Results</div>
                </div>
                <div class="content">
                    <p class="greeting">Dear <strong>${patientName}</strong>,</p>
                    <p style="color: #475569;">Here are your results from the <strong>${eventName}</strong> outreach.</p>
                    
                    <table class="table-container">
                        <thead>
                            <tr class="table-header">
                                <th>Test / Vital</th>
                                <th>Result</th>
                                <th>Reference Range</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>

                    <p style="color: #64748b; font-size: 13px; margin-top: 30px;">
                        <span style="display:inline-block; margin-right: 5px;">ℹ️</span>
                        <em>Always maintain a healthy lifestyle and follow up with your local healthcare provider for regular check-ups.</em>
                    </p>
                </div>
                <div class="footer">
                    <p class="disclaimer">This is an automated message. Please consult a doctor for interpretation of these results.</p>
                    <p>© ${new Date().getFullYear()} ReachPoint Medical Outreach. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Send Medical Result Email
 */
export async function sendMedicalResultEmail(
    email: string,
    patientName: string,
    eventName: string,
    vitals: Record<string, string>,
    tests: Record<string, string>
) {
    const html = getMedicalResultTemplate(patientName, eventName, vitals, tests);

    return sendEmail({
        to: email,
        subject: `Your Medical Results - ${eventName}`,
        html: html
    });
}
