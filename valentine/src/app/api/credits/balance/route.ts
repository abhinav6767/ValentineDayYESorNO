import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ credits: 0 });
    }

    const [user] = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, session.user.id));

    return NextResponse.json({ credits: user?.credits || 0 });
}
