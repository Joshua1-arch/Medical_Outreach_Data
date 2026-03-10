/**
 * lib/withAuth.ts
 *
 * Reusable wrapper for Next.js Route Handlers (App Router).
 * Handles:
 * 1. Session verification (NextAuth)
 * 2. Account status verification (must be 'active')
 * 3. Role-based Access Control (RBAC)
 * 4. Zod schema validation for request bodies
 * 5. NoSQL injection stripping on validated bodies
 */

import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { stripMongoOperators } from "@/lib/nosql-sanitize";

/**
 * Configuration options for the withAuth wrapper.
 */
interface WithAuthConfig<T extends z.ZodSchema> {
    /** 
     * Array of roles allowed to access this route. 
     * If empty or undefined, any logged-in user can access.
     */
    allowedRoles?: string[];
    /** 
     * Optional Zod schema to validate the incoming request body.
     */
    schema?: T;
}


export function withAuth<T extends z.ZodSchema = any>(
    handler: (
        req: NextRequest,
        context: {
            session: any;
            body: T extends z.ZodSchema ? z.infer<T> : any;
            params: any; // Already awaited params
        }
    ) => Promise<NextResponse>,
    config: WithAuthConfig<T> = {}
) {
    // The inner function must match the signature Next.js expects for Route Handlers
    return async (req: NextRequest, context: { params: Promise<any> }) => {
        try {
            // Await params as required by Next.js 15+
            const awaitedParams = await context.params;

            // 1. Authenticate Session
            const session = await auth();
            if (!session || !session.user) {
                return NextResponse.json(
                    { error: "Unauthorized: Please log in to access this resource" },
                    { status: 401 }
                );
            }

            // 2. Verify Account Status — blocks suspended/pending/rejected users
            if (session.user.accountStatus !== 'active') {
                return NextResponse.json(
                    { error: "Forbidden: Your account is not active" },
                    { status: 403 }
                );
            }

            // 3. Authorize Role
            if (config.allowedRoles && config.allowedRoles.length > 0) {
                const userRole = session.user.role;
                if (!config.allowedRoles.includes(userRole)) {
                    return NextResponse.json(
                        { error: "Forbidden: You do not have the required permissions" },
                        { status: 403 }
                    );
                }
            }

            // 4. Validate Body (for POST/PUT/PATCH) + strip NoSQL operators
            let body = undefined;
            if (config.schema) {
                try {
                    const json = await req.json();

                    // Strip NoSQL operators BEFORE validation
                    const sanitizedJson = stripMongoOperators(json);

                    const validation = config.schema.safeParse(sanitizedJson);

                    if (!validation.success) {
                        return NextResponse.json(
                            {
                                error: "Validation Failed: Invalid input format"
                            },
                            { status: 400 }
                        );
                    }
                    body = validation.data;
                } catch (e) {
                    return NextResponse.json(
                        { error: "Invalid Request: Body must be a valid JSON object" },
                        { status: 400 }
                    );
                }
            }

            // 5. Execute Protected Handler
            return await handler(req, { session, body: body as any, params: awaitedParams });

        } catch (error) {
            console.error("[API_PROTECTED_ERROR]:", error);
            return NextResponse.json(
                { error: "An error occurred. Please try again." },
                { status: 500 }
            );
        }
    };
}

// ---------------------------------------------------------------------------
// Server Action auth helper
// ---------------------------------------------------------------------------

interface ServerActionAuthResult {
    session: any;
    user: {
        id: string;
        role: string;
        accountStatus: string;
        isPremium: boolean;
        [key: string]: any;
    };
}

/**
 * Standard auth gate for Server Actions.
 * Call this at the top of every 'use server' function.
 *
 * @param allowedRoles - Optional array of roles. If provided, the user must have one of these roles.
 * @returns The verified session and user, or throws a structured error object.
 *
 * @example
 * export async function deleteEvent(eventId: string) {
 *     const { session, user } = await requireServerActionAuth(['admin']);
 *     // ... user is guaranteed to be an active admin here
 * }
 */
export async function requireServerActionAuth(
    allowedRoles?: string[]
): Promise<ServerActionAuthResult> {
    const session = await auth();

    if (!session?.user?.id) {
        return Promise.reject({ success: false, message: 'Unauthorized' });
    }

    if (session.user.accountStatus !== 'active') {
        return Promise.reject({ success: false, message: 'Account is not active' });
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(session.user.role)) {
            return Promise.reject({ success: false, message: 'Insufficient permissions' });
        }
    }

    return { session, user: session.user as ServerActionAuthResult['user'] };
}

