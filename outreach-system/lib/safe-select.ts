/**
 * lib/safe-select.ts
 *
 * OWASP A02: Sensitive Data Exposure — Mongoose field exclusion constants.
 *
 * Use these constants with Mongoose `.select()` to ensure passwords,
 * reset tokens, Turnstile secrets, and other sensitive fields are
 * NEVER accidentally returned to the frontend.
 *
 * ─── Usage Examples ──────────────────────────────────────────────
 *
 * // Fetching a single user profile for the frontend:
 * const user = await User.findById(id).select(SAFE_USER_SELECT).lean();
 *
 * // Fetching a list of users for an admin table:
 * const users = await User.find({}).select(SAFE_USER_SELECT).lean();
 *
 * // When you NEED the password (e.g. login comparison):
 * const user = await User.findById(id).select('+password').lean();
 *   ↳ This works because the UserSchema has `select: false` on password.
 *
 * // Fetching patient records (strip internal IDs):
 * const records = await Record.find({ eventId }).select(SAFE_RECORD_SELECT).lean();
 *
 * ─────────────────────────────────────────────────────────────────
 */

// ---------------------------------------------------------------------------
// User model — excludes all auth secrets
// ---------------------------------------------------------------------------

/**
 * Excludes: password, resetPasswordToken, resetPasswordExpires
 *
 * Use this for ANY query that returns user data to the frontend.
 */
export const SAFE_USER_SELECT = '-password -resetPasswordToken -resetPasswordExpires';

/**
 * Minimal public profile fields — use for populating references
 * e.g. `.populate('createdBy', SAFE_USER_PUBLIC_FIELDS)`
 */
export const SAFE_USER_PUBLIC_FIELDS = 'name email profileImage role medicalRole';

// ---------------------------------------------------------------------------
// Record model — excludes internal tracking fields
// ---------------------------------------------------------------------------

/**
 * Excludes: patientHash (internal dedup key), __v (Mongoose version key)
 *
 * Use when returning patient records/form submissions to the frontend.
 */
export const SAFE_RECORD_SELECT = '-patientHash -__v';

// ---------------------------------------------------------------------------
// Invitation Code model — excludes sensitive metadata
// ---------------------------------------------------------------------------

/**
 * Public-safe fields for invitation codes (admin view).
 * Excludes the internal MongoDB version key.
 */
export const SAFE_INVITATION_CODE_SELECT = '-__v';
