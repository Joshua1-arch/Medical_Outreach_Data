/**
 * app/api/admin/zones/route.ts
 * 
 * EXAMPLE: Implementing a protected admin route using withAuth.
 */

import { withAuth } from "@/lib/withAuth";
import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
// import Zone from "@/models/Zone"; // Assuming you have a Zone model

/**
 * 1. Define the Validation Schema
 * This prevents NoSQL injections and ensures your database only receives
 * the data types it expects.
 */
const UpdateZoneSchema = z.object({
  id: z.string().min(1, "Zone ID is required"),
  name: z.string().min(3, "Zone name must be at least 3 characters"),
  region: z.enum(["North", "South", "East", "West", "Central"]),
  isActive: z.boolean().default(true),
  capacity: z.number().int().positive().optional(),
});

/**
 * 2. Implement the Handler
 * The 'body' is already typed and validated by the wrapper.
 * The 'session' contains the verified user info.
 */
export const PUT = withAuth(
  async (req, { body, session }) => {
    // try {
    //   await dbConnect();
    //   
    //   // Because of the schema, 'body' is safe to use directly
    //   const updatedZone = await Zone.findByIdAndUpdate(
    //     body.id,
    //     { 
    //         name: body.name, 
    //         region: body.region, 
    //         isActive: body.isActive 
    //     },
    //     { new: true }
    //   );
    //
    //   if (!updatedZone) {
    //     return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    //   }
    //
    //   return NextResponse.json({ 
    //     success: true, 
    //     data: updatedZone,
    //     updatedBy: session.user.email 
    //   });
    // } catch (error) {
    //   throw error; // Caught by wrapper as 500
    // }

    // Dummy response for the example
    return NextResponse.json({ 
        message: "Example route: Zone updated successfully",
        validatedBody: body,
        adminUser: session.user.name
    });
  },
  {
    // 3. Configure Protection
    allowedRoles: ["admin"], // Matches 'admin' from your User model
    schema: UpdateZoneSchema, // Enforces strict structure
  }
);

/**
 * You can also use it for non-body routes (GET/DELETE) by omitting the schema.
 */
export const GET = withAuth(
    async (req, { session }) => {
        return NextResponse.json({ 
            message: "Authorized GET access",
            user: session.user.email 
        });
    },
    { allowedRoles: ["admin", "user"] } // Both roles can view
);
