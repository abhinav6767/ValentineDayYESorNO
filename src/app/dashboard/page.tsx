import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { pages, orders, templates, users } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { FloatingNav } from "@/components/layout/floating-navbar";
import Image from "next/image";
import { getValidImageUrl } from "@/lib/utils";
import BuyCredits from "@/components/credits/buy-credits";

export const revalidate = 0;

export default async function DashboardPage() {
    const session = await auth();
    const userId = session!.user!.id!;
    const userRole = (session?.user as any)?.role;

    // Auto-fix: Link anonymous pages to current user if they exist
    if (userId) {
        await db.update(pages).set({ userId }).where(isNull(pages.userId));
    }

    // Fetch user's pages with template info
    const userPages = await db
        .select({
            page: pages,
            templateName: templates.name,
            templateThumbnail: templates.thumbnail,
        })
        .from(pages)
        .leftJoin(templates, eq(pages.templateId, templates.id))
        .where(eq(pages.userId, userId));

    // Fetch user's orders
    const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId));

    // Fetch user's credits
    const [userRecord] = await db
        .select({ credits: users.credits })
        .from(users)
        .where(eq(users.id, userId));
    const userCredits = userRecord?.credits || 0;

    const totalPages = userPages.length;
    const totalOrders = userOrders.length;
    const paidOrders = userOrders.filter(o => o.status === "paid").length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-500">
            <FloatingNav />

            <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        {session?.user?.image && (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || "Profile"}
                                width={56}
                                height={56}
                                className="rounded-full ring-2 ring-pink-500/50"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white">
                                Welcome back, {session?.user?.name?.split(" ")[0] || "Creator"} 👋
                            </h1>
                            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                                Manage your creations and orders{userRole === "ADMIN" ? " • Admin Mode 🛡️" : ""}
                            </p>
                        </div>
                    </div>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-full text-sm font-medium border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        >
                            🚪 Logout
                        </button>
                    </form>
                </div>

                {/* Admin Panel — only visible to admins */}
                {userRole === "ADMIN" && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-6 flex items-center gap-2">
                            🛡️ Admin Panel
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Link href="/admin" className="group">
                                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 backdrop-blur-sm border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                                    <div className="text-3xl mb-3">📊</div>
                                    <h3 className="font-bold text-neutral-800 dark:text-white">Dashboard</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Overview, stats & analytics</p>
                                </div>
                            </Link>
                            <Link href="/admin/reviews" className="group">
                                <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 backdrop-blur-sm border border-pink-200 dark:border-pink-500/20 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                                    <div className="text-3xl mb-3">⭐</div>
                                    <h3 className="font-bold text-neutral-800 dark:text-white">Manage Reviews</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Approve, reject & moderate reviews</p>
                                </div>
                            </Link>
                            <Link href="/admin/credits" className="group">
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 backdrop-blur-sm border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                                    <div className="text-3xl mb-3">🪙</div>
                                    <h3 className="font-bold text-neutral-800 dark:text-white">Manage Credits</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">View & adjust user credits</p>
                                </div>
                            </Link>
                            <Link href="/admin/templates" className="group">
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 backdrop-blur-sm border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                                    <div className="text-3xl mb-3">📄</div>
                                    <h3 className="font-bold text-neutral-800 dark:text-white">Manage Templates</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Create & edit templates</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 backdrop-blur-sm border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 shadow-sm">
                        <div className="text-3xl mb-2">🪙</div>
                        <p className="text-sm text-amber-600 dark:text-amber-400">My Credits</p>
                        <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">{userCredits}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
                        <div className="text-3xl mb-2">📄</div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Pages Created</p>
                        <p className="text-3xl font-bold text-neutral-800 dark:text-white mt-1">{totalPages}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
                        <div className="text-3xl mb-2">🛒</div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Orders</p>
                        <p className="text-3xl font-bold text-neutral-800 dark:text-white mt-1">{totalOrders}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Paid Orders</p>
                        <p className="text-3xl font-bold text-neutral-800 dark:text-white mt-1">{paidOrders}</p>
                    </div>
                </div>

                {/* Credits Section */}
                <div id="credits" className="mb-12 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-6">My Credits</h2>
                    <div className="bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Balance</p>
                                <p className="text-4xl font-bold mt-1">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600">🪙 {userCredits} credits</span>
                                </p>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                                    Earn credits by writing reviews • 1 credit = ₹1
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                                <div className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                    📝 Text review = +15 credits
                                </div>
                                <div className="px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400">
                                    🎬 Video review = +40 credits
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-8">
                            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-4">Buy More Credits</h3>
                            <BuyCredits />
                        </div>
                    </div>
                </div>

                {/* My Pages */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">My Pages</h2>
                        <Link
                            href="/#templates"
                            className="text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors"
                        >
                            + Create New
                        </Link>
                    </div>

                    {userPages.length === 0 ? (
                        <div className="text-center py-16 bg-white/50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-200 dark:border-neutral-700 border-dashed">
                            <p className="text-4xl mb-4">🎨</p>
                            <p className="text-neutral-500 dark:text-neutral-400 text-lg">You haven&apos;t created any pages yet.</p>
                            <Link
                                href="/#templates"
                                className="mt-4 inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 text-white font-medium hover:from-pink-600 hover:to-violet-700 transition-all"
                            >
                                Start Creating
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userPages.map(({ page, templateName, templateThumbnail }) => (
                                <div
                                    key={page.id}
                                    className="bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div className="relative h-40 overflow-hidden">
                                        <Image
                                            src={getValidImageUrl(templateThumbnail || null)}
                                            alt={templateName || "Page"}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${page.isPaid
                                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                }`}>
                                                {page.isPaid ? "✓ Active" : "⏳ Unpaid"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-semibold text-neutral-800 dark:text-white">{templateName || "Custom Page"}</h3>
                                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                            Created {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : "recently"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-4">
                                            <Link
                                                href={`/p/${page.slug}`}
                                                className="flex-1 text-center text-sm py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors font-medium"
                                            >
                                                View Page
                                            </Link>
                                            <button
                                                className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-sm"
                                                title="Copy link"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Orders */}
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-6">Order History</h2>

                    {userOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white/50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-200 dark:border-neutral-700 border-dashed">
                            <p className="text-4xl mb-4">🧾</p>
                            <p className="text-neutral-500 dark:text-neutral-400">No orders yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white/80 dark:bg-neutral-800/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                            <th className="text-left py-3 px-5 text-sm font-medium text-neutral-500 dark:text-neutral-400">Order ID</th>
                                            <th className="text-left py-3 px-5 text-sm font-medium text-neutral-500 dark:text-neutral-400">Amount</th>
                                            <th className="text-left py-3 px-5 text-sm font-medium text-neutral-500 dark:text-neutral-400">Status</th>
                                            <th className="text-left py-3 px-5 text-sm font-medium text-neutral-500 dark:text-neutral-400">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                                <td className="py-3 px-5 text-sm text-neutral-700 dark:text-neutral-200 font-mono">#{order.id}</td>
                                                <td className="py-3 px-5 text-sm text-neutral-700 dark:text-neutral-200 font-semibold">₹{(order.amount / 100).toFixed(2)}</td>
                                                <td className="py-3 px-5">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${order.status === "paid"
                                                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                                                        : order.status === "failed"
                                                            ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                                                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-5 text-sm text-neutral-500 dark:text-neutral-400">
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
