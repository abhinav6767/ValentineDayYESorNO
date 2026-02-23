"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import Script from "next/script";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PRESET_AMOUNTS = [50, 100, 150, 200, 500];

export default function BuyCredits() {
    const { data: session, status } = useSession();
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const amount = selectedAmount || Number(customAmount) || 0;

    const handlePurchase = async () => {
        if (status === "unauthenticated") {
            signIn("google");
            return;
        }

        if (amount < 1) return;

        setIsLoading(true);
        setSuccessMessage("");

        try {
            // Create order
            const res = await fetch("/api/credits/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            });

            if (res.status === 401) {
                signIn("google");
                return;
            }

            const order = await res.json();
            if (order.error) {
                alert(order.error);
                setIsLoading(false);
                return;
            }

            // Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "OmniTemplates",
                description: `Buy ${order.credits} Credits`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    // Verify payment
                    const verifyRes = await fetch("/api/credits/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            credits: order.credits,
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        setSuccessMessage(
                            `🎉 ${verifyData.creditsAdded} credits added! New balance: ${verifyData.newBalance}`
                        );
                    } else {
                        alert("Payment verification failed");
                    }
                },
                prefill: {
                    name: session?.user?.name || "User",
                    email: session?.user?.email || "",
                },
                theme: {
                    color: "#db2777",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                alert(response.error.description);
            });
            rzp.open();
        } catch (error) {
            console.error("Purchase failed:", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="space-y-6">
                {/* Info */}
                <div className="text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="font-semibold text-pink-500">1 Credit = ₹1</span>{" "}
                        — Use credits to unlock premium templates
                    </p>
                </div>

                {/* Preset Amounts */}
                <div className="flex flex-wrap justify-center gap-3">
                    {PRESET_AMOUNTS.map((amt) => (
                        <motion.button
                            key={amt}
                            onClick={() => {
                                setSelectedAmount(amt);
                                setCustomAmount("");
                            }}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${selectedAmount === amt
                                    ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white border-transparent shadow-lg shadow-pink-500/20"
                                    : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:border-pink-300 dark:hover:border-pink-500/30"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ₹{amt}
                            <span className="block text-[10px] font-normal opacity-70">
                                {amt} credits
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className="flex items-center gap-3 max-w-xs mx-auto">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        or
                    </span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => {
                                setCustomAmount(e.target.value);
                                setSelectedAmount(null);
                            }}
                            placeholder="Custom"
                            min={1}
                            max={10000}
                            className="w-full pl-7 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        />
                    </div>
                </div>

                {/* Buy Button */}
                <div className="text-center">
                    <motion.button
                        onClick={handlePurchase}
                        disabled={isLoading || amount < 1}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold hover:from-pink-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading
                            ? "Processing..."
                            : amount > 0
                                ? `Buy ${amount} Credits for ₹${amount}`
                                : "Select an amount"}
                    </motion.button>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            className="text-center p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-medium"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
