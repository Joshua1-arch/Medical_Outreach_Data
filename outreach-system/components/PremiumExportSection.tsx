"use client";

import { useRef, useState } from "react";
import type { Session } from "next-auth";
import { generatePdf, PatientRecord } from "@/lib/generatePdf";
import UpgradeToProButton from "@/components/UpgradeToProButton";

interface PremiumExportSectionProps {
    session: Session;
    eventData: PatientRecord[];
}

/**
 * Reads a File object and returns its Base64 data URL string.
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

/**
 * Conditionally renders a premium-locked card OR the active PDF export controls
 * depending on whether session.user.isPremium is true.
 */
export default function PremiumExportSection({
    session,
    eventData,
}: PremiumExportSectionProps) {
    const [logoBase64, setLogoBase64] = useState<string | undefined>(undefined);
    const [logoFileName, setLogoFileName] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const base64 = await fileToBase64(file);
            setLogoBase64(base64);
            setLogoFileName(file.name);
        } catch (err) {
            console.error("Could not read logo file:", err);
        }
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        setPdfError(null);
        try {
            await generatePdf(eventData, logoBase64);
        } catch (err) {
            console.error("[PremiumExportSection] PDF generation failed:", err);
            setPdfError("PDF generation failed. Please try again or check the browser console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Locked state ──────────────────────────────────────────────────────────
    if (!session.user.isPremium) {
        return (
            <div className="
                relative rounded-2xl border border-dashed border-amber-300
                bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700
                p-8 flex flex-col items-center gap-4 text-center
            ">
                {/* Lock icon */}
                <div className="
                    w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40
                    flex items-center justify-center shadow-inner
                ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-7 h-7 text-amber-500"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Premium PDF Export
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Unlock custom-branded PDF exports with your logo to share
                        professional outreach reports with your team.
                    </p>
                </div>

                <UpgradeToProButton
                    email={session.user.email ?? ""}
                    userId={session.user.id}
                />
            </div>
        );
    }

    // ── Unlocked / Premium state ───────────────────────────────────────────────
    return (
        <div className="
            rounded-2xl border border-blue-200 dark:border-blue-800
            bg-white dark:bg-gray-900 p-6 shadow-sm
            flex flex-col gap-5
        ">
            {/* Header */}
            <div className="flex items-center gap-3">
                <span className="
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    text-xs font-semibold bg-amber-100 text-amber-700
                    dark:bg-amber-900/40 dark:text-amber-400
                ">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-3 h-3"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8 1l2 4 4.5.65-3.25 3.17.77 4.48L8 11.25 3.98 13.3l.77-4.48L1.5 5.65 6 5z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Pro
                </span>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    Export Outreach Report as PDF
                </h3>
            </div>

            {/* Logo upload */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="logo-upload"
                    className="text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                    Organisation Logo{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="
                            px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                            text-sm text-gray-700 dark:text-gray-300
                            bg-gray-50 dark:bg-gray-800
                            hover:bg-gray-100 dark:hover:bg-gray-700
                            transition-colors duration-150 focus:outline-none
                            focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                        "
                    >
                        Choose Image
                    </button>
                    <span className="text-sm text-gray-400 truncate max-w-[180px]">
                        {logoFileName || "No file chosen"}
                    </span>
                    {logoBase64 && (
                        /* Small preview */
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoBase64}
                            alt="Logo preview"
                            className="h-8 w-auto rounded border border-gray-200 dark:border-gray-700 object-contain"
                        />
                    )}
                </div>
                {/* Hidden native file input */}
                <input
                    ref={fileInputRef}
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoChange}
                />
            </div>

            {/* Download button */}
            <button
                type="button"
                disabled={isGenerating}
                onClick={handleDownload}
                className="
                    self-start inline-flex items-center gap-2 px-5 py-2.5
                    rounded-xl font-semibold text-sm text-white
                    bg-gradient-to-r from-blue-600 to-indigo-600
                    hover:from-blue-500 hover:to-indigo-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-md hover:shadow-lg hover:-translate-y-0.5
                    active:scale-95 transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                "
            >
                {isGenerating ? (
                    <>
                        <svg
                            className="animate-spin w-4 h-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12" cy="12" r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                        </svg>
                        Generating…
                    </>
                ) : (
                    <>
                        {/* Download icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                        >
                            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        Download PDF
                    </>
                )}
            </button>

            {/* Error feedback */}
            {pdfError && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    ⚠️ {pdfError}
                </p>
            )}

            {eventData.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                    ℹ️ No records in this event yet — the PDF will export with a blank table.
                </p>
            )}
        </div>
    );
}
