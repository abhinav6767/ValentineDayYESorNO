import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { orders, pages, templates, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageId } = await req.json();

    if (!pageId) {
        return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
    }

    // Fetch page and template to get price
    const [page] = await db.select().from(pages).where(eq(pages.id, pageId));
    if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (!page.templateId) {
        return NextResponse.json({ error: "Invalid page template" }, { status: 400 });
    }

    const [template] = await db.select().from(templates).where(eq(templates.id, page.templateId));
    if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const amount = template.salePrice || template.price;

    if (amount <= 0) {
        return NextResponse.json({ error: "Page is free" }, { status: 400 });
    }

    try {
        const order = await razorpay.orders.create({
            amount: amount, // Amount in lowest denomination (e.g. paise)
            currency: "INR",
            receipt: `receipt_${pageId}`,
        });

        // Save order to DB
        await db.insert(orders).values({
            userId: session?.user?.id,
            amount: amount,
            status: "pending",
            orderId: order.id,
            pageId: pageId,
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
