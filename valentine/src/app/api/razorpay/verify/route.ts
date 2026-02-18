import { db } from "@/db";
import { orders, pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Update order status
        await db
            .update(orders)
            .set({
                status: "paid",
                paymentId: razorpay_payment_id
            })
            .where(eq(orders.orderId, razorpay_order_id));

        // Get the page ID from the order
        const [order] = await db.select().from(orders).where(eq(orders.orderId, razorpay_order_id));

        if (order && order.pageId) {
            // Mark page as paid
            await db.update(pages).set({ isPaid: true }).where(eq(pages.id, order.pageId));
        }

        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
}
