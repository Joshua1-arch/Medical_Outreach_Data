import { sendEmail } from './email';

// Inline the shared brand colours / helpers so this file is self-contained
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const LOGO_URL = `${BASE_URL}/Reach.png`;
const YEAR = new Date().getFullYear();

const emailHeader = () => `
    <div style="background-color:#000000; padding:28px 40px; text-align:center;">
        <img src="${LOGO_URL}" alt="ReachPoint" width="160" height="auto"
             style="display:inline-block; max-width:160px; height:auto;" />
    </div>
    <div style="background-color:#fbbf38; height:4px;"></div>
`;

const emailFooter = () => `
    <div style="background-color:#f5f5f5; border-top:1px solid #e0e0e0; padding:24px 40px; text-align:center;">
        <p style="margin:0 0 6px; color:#555555; font-size:13px; font-style:italic;">
            Please consult a qualified healthcare provider for interpretation of these results.
        </p>
        <p style="margin:0; color:#999999; font-size:12px;">
            &copy; ${YEAR} ReachPoint Medical Outreach. All rights reserved.
        </p>
        <p style="margin:6px 0 0; color:#bbbbbb; font-size:11px;">
            This is an automated notification. Please do not reply to this message.
        </p>
    </div>
`;

// ---------------------------------------------------------------------------
// Reference ranges for common medical metrics
// ---------------------------------------------------------------------------
const getReferenceRange = (testName: string): string => {
    const lower = testName.toLowerCase();
    if (lower.includes('bp') || lower.includes('blood pressure')) return '90/60 - 120/80 mmHg';
    if (lower.includes('systolic')) return '90 - 120 mmHg';
    if (lower.includes('diastolic')) return '60 - 80 mmHg';
    if (lower.includes('malaria')) return 'Negative';
    if (lower.includes('bmi')) return '18.5 - 24.9';
    if (lower.includes('sugar') || lower.includes('glucose')) return '70 - 140 mg/dL';
    if (lower.includes('hiv')) return 'Non-Reactive';
    if (lower.includes('hbsag') || lower.includes('hepb')) return 'Non-Reactive';
    if (lower.includes('hepc')) return 'Non-Reactive';
    if (lower.includes('pulse') || lower.includes('heart rate')) return '60 - 100 bpm';
    if (lower.includes('temp')) return '36.1 - 37.2 C';
    if (lower.includes('spo2')) return '95% - 100%';
    if (lower.includes('pcv') || lower.includes('hematocrit')) return '35% - 50%';
    if (lower.includes('weight')) return 'Varies by height';
    if (lower.includes('height')) return 'N/A';
    if (lower.includes('blood group')) return 'N/A';
    if (lower.includes('rhesus')) return 'N/A';
    return '-';
};

// ---------------------------------------------------------------------------
// Build table rows from result data
// ---------------------------------------------------------------------------
const createRows = (data: Record<string, string>): string => {
    const skipKeys = ['email', 'phone', 'name', 'gender', 'sex', 'age', 'address', 'remarks', 'full name'];
    let rowIndex = 0;

    return Object.entries(data).map(([key, value]) => {
        if (!value || key.startsWith('_')) return '';
        if (skipKeys.some(k => key.toLowerCase().includes(k))) return '';

        const label = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]/g, ' ')
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());

        const range = getReferenceRange(key);
        const rowBg = rowIndex % 2 === 0 ? '#ffffff' : '#fafafa';
        rowIndex++;

        return `
            <tr style="background-color:${rowBg};">
                <td style="padding:12px 16px; font-size:14px; color:#333333; font-weight:500;
                            border-bottom:1px solid #eeeeee;">${label}</td>
                <td style="padding:12px 16px; font-size:14px; color:#000000; font-weight:700;
                            border-bottom:1px solid #eeeeee;">${value}</td>
                <td style="padding:12px 16px; font-size:13px; color:#888888;
                            border-bottom:1px solid #eeeeee;">${range}</td>
            </tr>
        `;
    }).join('');
};

// ---------------------------------------------------------------------------
// Build the full patient info header row
// ---------------------------------------------------------------------------
const patientInfoRow = (patientName: string, eventName: string) => `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#000000; margin-bottom:24px; border-radius:4px;">
        <tr>
            <td style="padding:16px 20px;">
                <p style="margin:0 0 2px; font-size:11px; font-weight:700; text-transform:uppercase;
                           letter-spacing:1.2px; color:#fbbf38;">Patient</p>
                <p style="margin:0; font-size:18px; font-weight:700; color:#ffffff;">${patientName}</p>
            </td>
            <td style="padding:16px 20px; text-align:right;">
                <p style="margin:0 0 2px; font-size:11px; font-weight:700; text-transform:uppercase;
                           letter-spacing:1.2px; color:#fbbf38;">Outreach Event</p>
                <p style="margin:0; font-size:14px; font-weight:600; color:#ffffff;">${eventName}</p>
            </td>
        </tr>
    </table>
`;

// ---------------------------------------------------------------------------
// getMedicalResultTemplate
// ---------------------------------------------------------------------------
export function getMedicalResultTemplate(
    patientName: string,
    eventName: string,
    vitals: Record<string, string>,
    tests: Record<string, string>
) {
    const allData = { ...vitals, ...tests };
    const rows = createRows(allData);

    if (!rows.trim()) {
        return `<div>No results to display.</div>`;
    }

    const body = `
        ${patientInfoRow(patientName, eventName)}
        <p style="margin:0 0 8px; font-size:15px; color:#333333; line-height:1.7;">
            Dear <strong>${patientName}</strong>,
        </p>
        <p style="margin:0 0 24px; font-size:15px; color:#555555; line-height:1.7;">
            Please find below your health screening results from the
            <strong style="color:#000000;">${eventName}</strong> outreach programme.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0"
               style="border-collapse:collapse; border:1px solid #e8e8e8; border-radius:4px;
                      overflow:hidden; font-size:14px; margin-bottom:24px;">
            <thead>
                <tr style="background-color:#000000;">
                    <th style="padding:11px 16px; text-align:left; font-size:11px; font-weight:700;
                                text-transform:uppercase; letter-spacing:1.2px; color:#fbbf38;">
                        Test / Vital
                    </th>
                    <th style="padding:11px 16px; text-align:left; font-size:11px; font-weight:700;
                                text-transform:uppercase; letter-spacing:1.2px; color:#fbbf38;">
                        Your Result
                    </th>
                    <th style="padding:11px 16px; text-align:left; font-size:11px; font-weight:700;
                                text-transform:uppercase; letter-spacing:1.2px; color:#fbbf38;">
                        Reference Range
                    </th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <div style="border-left:4px solid #fbbf38; background-color:#fffbeb;
                    padding:14px 18px; border-radius:0 4px 4px 0; margin-bottom:8px;">
            <p style="margin:0; font-size:13px; color:#555555; line-height:1.6;">
                <strong style="color:#000000;">Important:</strong>
                These results are for informational purposes only. Please follow up with a
                qualified healthcare provider for a full clinical interpretation and any
                recommended treatment or lifestyle advice.
            </p>
        </div>
    `;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Medical Results - ReachPoint</title>
</head>
<body style="margin:0; padding:0; background-color:#ebebeb;
              font-family:'Segoe UI', Arial, sans-serif; color:#1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#ebebeb; padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                       style="max-width:600px; width:100%; background-color:#ffffff;
                              border-radius:8px; overflow:hidden;
                              box-shadow:0 2px 12px rgba(0,0,0,0.12);">
                    <tr><td>${emailHeader()}</td></tr>
                    <tr><td style="padding:36px 40px;">${body}</td></tr>
                    <tr><td>${emailFooter()}</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

// ---------------------------------------------------------------------------
// sendMedicalResultEmail
// ---------------------------------------------------------------------------
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
        subject: `Your Health Screening Results - ${eventName}`,
        html
    });
}
