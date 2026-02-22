/**
 * lib/withAuth.ts
 *
 * Reusable wrapper for Next.js Route Handlers (App Router).
 * Handles:
 * 1. Session verification (NextAuth)
 * 2. Role-based Access Control (RBAC)
 * 3. Zod schema validation for request bodies
 */

import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";

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

/**
 * withAuth
 * 
 * Higher-order function that wraps a Next.js API handler.
 * Automatically handles auth checks and validation.
 */
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

            // 2. Authorize Role
            if (config.allowedRoles && config.allowedRoles.length > 0) {
                const userRole = session.user.role;
                if (!config.allowedRoles.includes(userRole)) {
                    return NextResponse.json(
                        { error: "Forbidden: You do not have the required permissions" }, 
                        { status: 403 }
                    );
                }
            }

            // 3. Validate Body (for POST/PUT/PATCH)
            let body = undefined;
            if (config.schema) {
                try {
                    const json = await req.json();
                    const validation = config.schema.safeParse(json);

                    if (!validation.success) {
                        return NextResponse.json(
                            { 
                                error: "Validation Failed", 
                                details: validation.error.format() 
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

            // 4. Execute Protected Handler
            return await handler(req, { session, body: body as any, params: awaitedParams });

        } catch (error) {
            console.error("[API_PROTECTED_ERROR]:", error);
            return NextResponse.json(
                { error: "Internal Server Error" }, 
                { status: 500 }
            );
        }
    };
}
