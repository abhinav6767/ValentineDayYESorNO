import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { users, orders, pages, reviews, creditTransactions } from "@/db/schema";
import { count, sum, eq, desc, sql } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
    const [userCount] = await db.select({ value: count() }).from(users);
    const [orderCount] = await db.select({ value: count() }).from(orders);
    const [pageCount] = await db.select({ value: count() }).from(pages);
    const [pendingReviewCount] = await db
        .select({ value: count() })
        .from(reviews)
        .where(eq(reviews.status, "pending"));
    const [totalReviewCount] = await db.select({ value: count() }).from(reviews);

    // Total earnings from paid orders
    const [totalEarnings] = await db
        .select({ value: sum(orders.amount) })
        .from(orders)
        .where(eq(orders.status, "paid"));

    // Total credits in circulation
    const [totalCredits] = await db
        .select({ value: sum(users.credits) })
        .from(users);

    // Recent pages
    const recentPages = await db
        .select({
            id: pages.id,
            slug: pages.slug,
            isPaid: pages.isPaid,
            createdAt: pages.createdAt,
            userName: users.name,
        })
        .from(pages)
        .leftJoin(users, eq(pages.userId, users.id))
        .orderBy(desc(pages.createdAt))
        .limit(10);

    // Recent orders for earnings trend (last 7 days)
    const recentOrders = await db
        .select({
            amount: orders.amount,
            createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.status, "paid"))
        .orderBy(desc(orders.createdAt))
        .limit(50);

    // Calculate daily earnings for chart
    const dailyEarnings: { date: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayTotal = recentOrders
            .filter((o) => o.createdAt?.toISOString().split("T")[0] === dateStr)
            .reduce((sum, o) => sum + o.amount, 0);
        dailyEarnings.push({
            date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            amount: dayTotal,
        });
    }

    const maxEarning = Math.max(...dailyEarnings.map((d) => d.amount), 1);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <span className="text-2xl">👥</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount.value}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <span className="text-2xl">💰</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{((Number(totalEarnings.value) || 0) / 100).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pages Created</CardTitle>
                        <span className="text-2xl">📄</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pageCount.value}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <span className="text-2xl">⏳</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {pendingReviewCount.value}
                            {pendingReviewCount.value > 0 && (
                                <Link
                                    href="/admin/reviews"
                                    className="ml-2 text-sm font-normal text-amber-500 hover:underline"
                                >
                                    View →
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <span className="text-2xl">🛒</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderCount.value}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <span className="text-2xl">⭐</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReviewCount.value}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credits in Circulation</CardTitle>
                        <span className="text-2xl">🪙</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(totalCredits.value) || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Earnings — Last 7 Days</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2 h-40">
                        {dailyEarnings.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                    {day.amount > 0 ? `₹${(day.amount / 100).toFixed(0)}` : ""}
                                </span>
                                <div
                                    className="w-full rounded-t-md bg-gradient-to-t from-pink-500 to-violet-500 transition-all"
                                    style={{
                                        height: `${Math.max((day.amount / maxEarning) * 120, day.amount > 0 ? 4 : 2)}px`,
                                        opacity: day.amount > 0 ? 1 : 0.15,
                                    }}
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    {day.date}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Pages */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Pages Created</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentPages.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No pages yet</p>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left px-4 py-2 font-medium">Slug</th>
                                        <th className="text-left px-4 py-2 font-medium">User</th>
                                        <th className="text-left px-4 py-2 font-medium">Status</th>
                                        <th className="text-left px-4 py-2 font-medium">Created</th>
                                        <th className="text-left px-4 py-2 font-medium">Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPages.map((page) => (
                                        <tr key={page.id} className="border-t hover:bg-muted/30">
                                            <td className="px-4 py-2 font-mono text-xs">{page.slug}</td>
                                            <td className="px-4 py-2">{page.userName || "—"}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full ${page.isPaid
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {page.isPaid ? "Paid" : "Unpaid"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground text-xs">
                                                {page.createdAt?.toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </td>
                                            <td className="px-4 py-2">
                                                <a
                                                    href={`/p/${page.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Open →
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
