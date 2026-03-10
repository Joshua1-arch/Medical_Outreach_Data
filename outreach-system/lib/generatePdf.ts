import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PatientRecord {
    Name: string;
    BP: string;
    "Blood Group": string;
    [key: string]: string; // any additional columns are supported
}

/**
 * Generates and immediately downloads a branded PDF report.
 *
 * @param eventData  Array of patient-record objects. Column headers are derived
 *                   from the keys of the first element.
 * @param logoBase64 Optional Base64 data URL (e.g. "data:image/png;base64,…").
 *                   When provided the logo will be rendered centred at the top.
 */
export async function generatePdf(
    eventData: PatientRecord[],
    logoBase64?: string
): Promise<void> {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 15;

    // ── Logo ──────────────────────────────────────────────────────────────────
    if (logoBase64) {
        try {
            const logoWidth = 40;
            const logoHeight = 20;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(logoBase64, "PNG", logoX, currentY, logoWidth, logoHeight);
            currentY += logoHeight + 6;
        } catch (e) {
            console.warn("[generatePdf] Could not add logo image:", e);
            // Continue without the logo rather than failing the export
        }
    }

    // ── Title ─────────────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("ReachPoint Medical Outreach Report", pageWidth / 2, currentY, {
        align: "center",
    });
    currentY += 6;

    // ── Sub-title / date ──────────────────────────────────────────────────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
        `Generated on ${new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })}`,
        pageWidth / 2,
        currentY,
        { align: "center" }
    );
    currentY += 8;

    // ── Table ─────────────────────────────────────────────────────────────────
    if (eventData.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text("No records to display.", pageWidth / 2, currentY + 10, {
            align: "center",
        });
    } else {
        const columns = Object.keys(eventData[0]).map((key) => ({
            header: key,
            dataKey: key,
        }));

        const rows = eventData.map((record) => Object.values(record));

        autoTable(doc, {
            startY: currentY,
            head: [columns.map((c) => c.header)],
            body: rows,
            theme: "grid",
            headStyles: {
                fillColor: [37, 99, 235], // Tailwind blue-600
                textColor: 255,
                fontStyle: "bold",
                fontSize: 9,
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [40, 40, 40],
            },
            alternateRowStyles: {
                fillColor: [239, 246, 255], // Tailwind blue-50
            },
            margin: { left: 14, right: 14 },
        });
    }

    // ── Footer on every page ──────────────────────────────────────────────────
    const pageCount: number = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(
            `ReachPoint – Confidential  |  Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: "center" }
        );
    }

    doc.save("reachpoint-export.pdf");
}
