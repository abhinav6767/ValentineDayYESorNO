"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

interface RazorpayButtonProps {
    pageId: string;
    amount: number; // in paise
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RazorpayButton({ pageId, amount }: RazorpayButtonProps) {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        if (status === "unauthenticated") {
            signIn("google");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Create Order
            const res = await fetch("/api/razorpay/order", {
                method: "POST",
                body: JSON.stringify({ pageId }),
                headers: { "Content-Type": "application/json" },
            });
            const order = await res.json();

            if (res.status === 401) {
                signIn("google");
                return;
            }

            if (order.error) {
                alert(order.error);
                setIsLoading(false);
                return;
            }

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "OmniTemplates",
                description: "Premium Page Unlock",
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch("/api/razorpay/verify", {
                        method: "POST",
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                        headers: { "Content-Type": "application/json" },
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        router.refresh();
                    } else {
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: session?.user?.name || "User",
                    email: session?.user?.email || "user@example.com",
                },
                theme: {
                    color: "#db2777", // Pink-600
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response: any) {
                alert(response.error.description);
            });
            rzp1.open();
        } catch (error) {
            console.error("Payment failed", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") {
        return <Button disabled className="w-full">Loading...</Button>;
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Button
                onClick={handlePayment}
                disabled={isLoading}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
            >
                {isLoading ? "Processing..." : `Pay ${amount} 🪙 credits`}
            </Button>
        </>
    );
}
