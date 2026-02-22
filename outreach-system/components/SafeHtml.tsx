/**
 * components/SafeHtml.tsx
 *
 * Drop-in component for rendering sanitized database HTML safely.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE EXAMPLES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. Rich description from the database (default preset):
 *    <SafeHtml html={event.description} />
 *
 * 2. Only inline formatting (bold/italic/links):
 *    <SafeHtml html={comment.body} preset="basic" />
 *
 * 3. Strip ALL tags — plain text only:
 *    <SafeHtml html={record.notes} preset="text-only" />
 *
 * 4. Custom className on the wrapper:
 *    <SafeHtml html={post.content} className="prose prose-sm max-w-none" />
 *
 * 5. Allow extra tags beyond the preset (e.g. <details> / <summary>):
 *    <SafeHtml
 *      html={content}
 *      preset="rich"
 *      extraAllowedTags={['details', 'summary']}
 *    />
 *
 * 6. Inline (no wrapper div) — useful inside <p> or <td>:
 *    <SafeHtml html={cell.value} inline />
 *
 * 7. Direct utility usage (without the component, e.g. in a Server Component):
 *    import { sanitize, sanitizeText } from '@/lib/sanitize';
 *    const clean = sanitize(dbContent);
 *    const plain = sanitizeText(record.remarks);
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { sanitize, SanitizePreset } from '@/lib/sanitize';

interface SafeHtmlProps {
  /** Raw HTML or text string from the database. */
  html: string | null | undefined;
  /**
   * Sanitization level:
   *  - 'rich'      (default) — headings, lists, tables, images, links
   *  - 'basic'               — bold, italic, underline, links only
   *  - 'text-only'           — strips every tag, plain text output
   */
  preset?: SanitizePreset;
  /** Additional HTML tags to allow beyond the preset. */
  extraAllowedTags?: string[];
  /** Additional HTML attributes to allow beyond the preset. */
  extraAllowedAttrs?: string[];
  /** Tailwind / CSS class(es) applied to the wrapper element. */
  className?: string;
  /**
   * Render as an inline <span> instead of a block <div>.
   * Useful inside paragraphs, table cells, etc.
   */
  inline?: boolean;
}

/**
 * SafeHtml
 *
 * Renders user-supplied or database-sourced HTML using dangerouslySetInnerHTML
 * after passing it through the DOMPurify sanitizer. XSS-safe by design.
 */
export default function SafeHtml({
  html,
  preset = 'rich',
  extraAllowedTags = [],
  extraAllowedAttrs = [],
  className,
  inline = false,
}: SafeHtmlProps) {
  if (!html) return null;

  const cleanHtml = sanitize(html, { preset, extraAllowedTags, extraAllowedAttrs });

  const sharedProps = {
    className,
    dangerouslySetInnerHTML: { __html: cleanHtml },
  };

  return inline ? <span {...sharedProps} /> : <div {...sharedProps} />;
}


// ─────────────────────────────────────────────────────────────────────────────
// FULL USAGE DEMONSTRATION
// (This component is for illustration. Import SafeHtml into your real pages.)
// ─────────────────────────────────────────────────────────────────────────────

/** Simulated database values — the kind that could be XSS attack vectors. */
const DEMO_VALUES = {
  eventDescription: `
    <h2>Annual Medical Outreach</h2>
    <p>Join us for a <strong>free</strong> health screening event.
    We will be testing for <em>Malaria, HIV, and Hypertension</em>.</p>
    <ul>
      <li>Free blood pressure checks</li>
      <li>Malaria rapid tests</li>
      <li>BMI and weight measurement</li>
    </ul>
    <img src="/event-banner.jpg" alt="Event Banner" width="600" />
    <!-- XSS attempt below — will be stripped automatically -->
    <script>alert('XSS')</script>
    <img src="x" onerror="alert('XSS via onerror')" />
    <a href="javascript:alert('XSS via href')">Click me</a>
  `,

  comment: `
    <strong>Great event!</strong> Can't wait to attend.
    <!-- script tag — stripped in basic preset -->
    <script>fetch('/api/steal-cookies')</script>
    <p onmouseover="badFunction()">Hover me</p>
  `,

  notes: `
    Plain note with <b>formatting</b> and a
    <script>document.cookie</script> attack attempt.
    This will be returned as plain text only.
  `,
};

export function SafeHtmlDemo() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10 font-sans">
      <h1 className="text-2xl font-bold text-slate-800">SafeHtml — Usage Demo</h1>

      {/* ── 1. Rich preset (default) ── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          1 · Rich Preset (default) — full formatting, images, lists
        </h2>
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <SafeHtml
            html={DEMO_VALUES.eventDescription}
            preset="rich"
            className="prose prose-sm max-w-none text-slate-700"
          />
        </div>
        <pre className="mt-2 text-xs bg-slate-100 p-3 rounded-lg text-slate-600 overflow-x-auto">
          {`<SafeHtml html={event.description} preset="rich" className="prose prose-sm" />`}
        </pre>
      </section>

      {/* ── 2. Basic preset ── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          2 · Basic Preset — inline formatting only
        </h2>
        <div className="p-6 bg-white rounded-xl border border-slate-200">
          <SafeHtml
            html={DEMO_VALUES.comment}
            preset="basic"
            className="text-slate-700 text-sm"
          />
        </div>
        <pre className="mt-2 text-xs bg-slate-100 p-3 rounded-lg text-slate-600 overflow-x-auto">
          {`<SafeHtml html={comment.body} preset="basic" />`}
        </pre>
      </section>

      {/* ── 3. Text-only preset ── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          3 · Text-Only Preset — all tags stripped
        </h2>
        <div className="p-6 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm">
          <SafeHtml html={DEMO_VALUES.notes} preset="text-only" />
        </div>
        <pre className="mt-2 text-xs bg-slate-100 p-3 rounded-lg text-slate-600 overflow-x-auto">
          {`<SafeHtml html={record.notes} preset="text-only" />`}
        </pre>
      </section>

      {/* ── 4. Inline span ── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          4 · Inline — renders as &lt;span&gt; inside text
        </h2>
        <div className="p-6 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm">
          <p>
            Patient notes:{' '}
            <SafeHtml html="<strong>Blood pressure slightly elevated</strong>" preset="basic" inline />
          </p>
        </div>
        <pre className="mt-2 text-xs bg-slate-100 p-3 rounded-lg text-slate-600 overflow-x-auto">
          {`<SafeHtml html={cell.value} preset="basic" inline />`}
        </pre>
      </section>

      {/* ── 5. Server Component / utility usage ── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
          5 · Direct utility (Server Components, API routes, emails)
        </h2>
        <pre className="text-xs bg-slate-900 text-emerald-300 p-4 rounded-xl overflow-x-auto leading-relaxed">
{`// Server Component or lib function
import { sanitize, sanitizeText, sanitizeBasic } from '@/lib/sanitize';

// Full rich HTML
const cleanBody   = sanitize(post.body);

// Inline-only (bold, italic, links)
const cleanTitle  = sanitizeBasic(event.title);

// Plain text — safe for <meta> description, CSV cells, email plain-text
const plainNotes  = sanitizeText(record.remarks);

// Extra tags allowed (Rich preset + <details> / <summary>)
const cleanFaq    = sanitize(faq.content, {
  preset: 'rich',
  extraAllowedTags: ['details', 'summary'],
});`}
        </pre>
      </section>
    </div>
  );
}
