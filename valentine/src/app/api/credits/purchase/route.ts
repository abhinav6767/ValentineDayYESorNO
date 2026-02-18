import { razorpay } from "@/lib/razorpay";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

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

    const { amount } = body;

    // Validate amount (in rupees)
    if (!amount || typeof amount !== "number" || amount < 1 || amount > 10000) {
        return NextResponse.json(
            { error: "Amount must be between ₹1 and ₹10,000" },
            { status: 400 }
        );
    }

    // Only allow whole numbers
    if (!Number.isInteger(amount)) {
        return NextResponse.json(
            { error: "Amount must be a whole number" },
            { status: 400 }
        );
    }

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: "INR",
            receipt: `credits_${session.user.id}_${Date.now()}`,
            notes: {
                userId: session.user.id,
                type: "credit_purchase",
                credits: String(amount), // 1 credit = 1 rupee
            },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            credits: amount,
        });
    } catch (error) {
        console.error("Error creating credit purchase order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}
