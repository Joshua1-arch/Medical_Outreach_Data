/**
 * lib/sanitize.ts
 *
 * Isomorphic HTML sanitizer for ReachPoint.
 * Works identically on the server (Next.js SSR / Server Components)
 * and in the browser (Client Components / dangerouslySetInnerHTML).
 *
 * Package: isomorphic-dompurify
 *   - On the server it uses the jsdom DOM implementation.
 *   - In the browser it delegates to the native DOM (zero overhead).
 */

import DOMPurify from 'isomorphic-dompurify';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SanitizePreset = 'rich' | 'basic' | 'text-only';

interface SanitizeConfig {
  /** Which preset to use (controls allowed tags / attributes). */
  preset?: SanitizePreset;
  /**
   * Extra tags to allow on top of the preset.
   * Ignored when preset is 'text-only'.
   */
  extraAllowedTags?: string[];
  /**
   * Extra attributes to allow on top of the preset.
   * Ignored when preset is 'text-only'.
   */
  extraAllowedAttrs?: string[];
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

/**
 * 'rich'      – full formatting (headings, lists, tables, links, images)
 *               Suitable for: rich-text editor output, event descriptions.
 *
 * 'basic'     – inline formatting only (bold, italic, underline, links)
 *               Suitable for: short user-generated fields, comments.
 *
 * 'text-only' – strips ALL tags, returns plain text.
 *               Suitable for: meta content, search previews, email plain-text.
 */
const PRESETS: Record<SanitizePreset, DOMPurify.Config> = {
  rich: {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'u', 's', 'mark', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'a', 'img',
      'div', 'span',
      'figure', 'figcaption',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id',
      'colspan', 'rowspan',
      // data-* passthrough is handled separately below
    ],
    // Force all links to open in a new tab with safe rel attributes
    ADD_ATTR: ['target'],
    // Block javascript: URIs in href / src
    FORCE_BODY: true,
  },

  basic: {
    ALLOWED_TAGS: ['strong', 'em', 'u', 's', 'mark', 'code', 'a', 'br', 'span', 'p'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORCE_BODY: true,
  },

  'text-only': {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content even when stripping tags
  },
};

// ---------------------------------------------------------------------------
// DOMPurify hooks (applied globally, once)
// ---------------------------------------------------------------------------

// Force all <a> links to be safe (open in new tab, no referrer)
DOMPurify.addHook('afterSanitizeAttributes', (node: Element) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

// ---------------------------------------------------------------------------
// Core sanitize function
// ---------------------------------------------------------------------------

/**
 * Sanitize a string of HTML or plain text.
 *
 * @param input   - Raw HTML / text string from the database or user input.
 * @param options - Optional preset and extra allow-lists.
 * @returns       - Clean, XSS-free HTML string safe to render.
 *
 * @example
 * // Server Component or utility
 * const clean = sanitize(record.description);
 *
 * // Client Component
 * <div dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
 */
export function sanitize(
  input: string | null | undefined,
  options: SanitizeConfig = {}
): string {
  if (!input) return '';

  const { preset = 'rich', extraAllowedTags = [], extraAllowedAttrs = [] } = options;

  const baseConfig = PRESETS[preset];

  const config: DOMPurify.Config = {
    ...baseConfig,
    ...(preset !== 'text-only' && {
      ALLOWED_TAGS: [
        ...((baseConfig.ALLOWED_TAGS as string[]) ?? []),
        ...extraAllowedTags,
      ],
      ALLOWED_ATTR: [
        ...((baseConfig.ALLOWED_ATTR as string[]) ?? []),
        ...extraAllowedAttrs,
      ],
    }),
  };

  return DOMPurify.sanitize(input, config as any) as unknown as string;
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/** Strip to plain text — no tags whatsoever. */
export const sanitizeText = (input: string | null | undefined): string =>
  sanitize(input, { preset: 'text-only' });

/** Basic inline formatting only (bold, italic, links). */
export const sanitizeBasic = (input: string | null | undefined): string =>
  sanitize(input, { preset: 'basic' });

/** Full rich-text — headings, lists, tables, images. */
export const sanitizeRich = (input: string | null | undefined): string =>
  sanitize(input, { preset: 'rich' });
