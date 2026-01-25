'use client';

import { Download } from 'lucide-react';

export default function ExportDataButton() {
    return (
        <a
            href="/api/admin/export"
            target="_blank"
            download
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-brand-dark rounded-lg hover:bg-yellow-500 transition-colors font-bold shadow-sm text-sm"
        >
            <Download size={16} />
            Export All Data
        </a>
    );
}
