/**
 * lib/nosql-sanitize.ts
 *
 * Deep sanitizer that strips MongoDB query operators ($gt, $ne, $regex, etc.)
 * from any user-supplied input before it reaches Mongoose.
 *
 * This prevents NoSQL Operator Injection attacks where an attacker sends:
 *   { "email": "admin@x.com", "password": { "$gt": "" } }
 * which could bypass authentication or dump records.
 *
 * Usage:
 *   import { stripMongoOperators } from '@/lib/nosql-sanitize';
 *   const safeBody = stripMongoOperators(rawBody);
 */

// ---------------------------------------------------------------------------
// Core: recursively strip any key that starts with '$'
// ---------------------------------------------------------------------------

export function stripMongoOperators<T>(input: T): T {
    if (input === null || input === undefined) return input;

    // Strings, numbers, booleans pass through untouched
    if (typeof input !== 'object') return input;

    // Arrays: sanitize each element
    if (Array.isArray(input)) {
        return input.map(stripMongoOperators) as unknown as T;
    }

    // Plain objects: strip dangerous keys, recurse into values
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        // Block any key starting with '$' (MongoDB operator)
        if (key.startsWith('$')) continue;

        // Also block keys containing '.' which can be used for prototype pollution
        // or dot-notation injection in MongoDB updates
        if (key.includes('.')) continue;

        clean[key] = stripMongoOperators(value);
    }

    return clean as T;
}

// ---------------------------------------------------------------------------
// Convenience: validate that a value is a plain string (not an object)
// ---------------------------------------------------------------------------

/**
 * Ensures a value is a plain string. If an attacker sends
 * { "password": { "$gt": "" } } instead of a string, this returns null.
 *
 * Use this for individual fields like email, password, IDs, etc.
 */
export function ensureString(value: unknown): string | null {
    if (typeof value === 'string') return value;
    return null;
}

/**
 * Validates that a string looks like a valid MongoDB ObjectId.
 * Prevents injection through malformed ID parameters.
 */
export function isValidObjectId(id: unknown): boolean {
    if (typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
}
