import { db } from "@/db";
import { users, creditTransactions } from "@/db/schema";
import { auth } from "@/auth";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !credits) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
            { error: "Invalid payment signature" },
            { status: 400 }
        );
    }

    const creditAmount = Number(credits);
    if (!creditAmount || creditAmount < 1) {
        return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });
    }

    try {
        // Add credits to user
        await db
            .update(users)
            .set({ credits: sql`${users.credits} + ${creditAmount}` })
            .where(eq(users.id, session.user.id));

        // Log transaction
        await db.insert(creditTransactions).values({
            userId: session.user.id,
            amount: creditAmount,
            type: "purchase",
            description: `Purchased ${creditAmount} credits via Razorpay`,
            referenceId: razorpay_payment_id,
        });

        // Get updated balance
        const [user] = await db
            .select({ credits: users.credits })
            .from(users)
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            success: true,
            creditsAdded: creditAmount,
            newBalance: user?.credits || 0,
        });
    } catch (error) {
        console.error("Error verifying credit purchase:", error);
        return NextResponse.json(
            { error: "Failed to process payment" },
            { status: 500 }
        );
    }
}
