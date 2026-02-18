"use client";

import { useState, useTransition } from "react";
import { adjustCredits } from "./actions";

interface UserRow {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string | null;
    credits: number;
    createdAt: string;
}

interface TransactionRow {
    id: number;
    userId: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
    userName: string | null;
}

export default function CreditsManager({
    users,
    transactions,
}: {
    users: UserRow[];
    transactions: TransactionRow[];
}) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
    const [activeTab, setActiveTab] = useState<"users" | "transactions">("users");
    const [adjustModal, setAdjustModal] = useState<UserRow | null>(null);
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustReason, setAdjustReason] = useState("");
    const [isPending, startTransition] = useTransition();

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            !search ||
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalCreditsInCirculation = users.reduce((sum, u) => sum + u.credits, 0);

    const handleAdjust = () => {
        if (!adjustModal || !adjustAmount || !adjustReason.trim()) return;

        startTransition(async () => {
            try {
                await adjustCredits(adjustModal.id, Number(adjustAmount), adjustReason);
                setAdjustModal(null);
                setAdjustAmount("");
                setAdjustReason("");
            } catch (e: any) {
                alert(e.message || "Failed to adjust credits");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Credits in Circulation</p>
                    <p className="text-2xl font-bold">🪙 {totalCreditsInCirculation}</p>
                </div>
                <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Recent Transactions</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeTab === "users"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                >
                    👤 Users & Credits
                </button>
                <button
                    onClick={() => setActiveTab("transactions")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeTab === "transactions"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                >
                    📋 Transaction History
                </button>
            </div>

            {activeTab === "users" && (
                <>
                    {/* Search & Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="px-3 py-2 border rounded-lg text-sm bg-background w-64 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="all">All Roles</option>
                            <option value="USER">Users</option>
                            <option value="ADMIN">Admins</option>
                        </select>
                        <span className="text-sm text-muted-foreground">
                            {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    {/* Users Table */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium">User</th>
                                        <th className="text-left px-4 py-3 font-medium">Email</th>
                                        <th className="text-left px-4 py-3 font-medium">Role</th>
                                        <th className="text-left px-4 py-3 font-medium">Credits</th>
                                        <th className="text-left px-4 py-3 font-medium">Joined</th>
                                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-t hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {user.image ? (
                                                        <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                            {(user.name || "?")[0]}
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{user.name || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === "ADMIN"
                                                            ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300"
                                                            : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                                                        }`}
                                                >
                                                    {user.role || "USER"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-bold">🪙 {user.credits}</td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setAdjustModal(user)}
                                                    className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-muted transition-colors"
                                                >
                                                    ⚙️ Adjust
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "transactions" && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium">User</th>
                                    <th className="text-left px-4 py-3 font-medium">Amount</th>
                                    <th className="text-left px-4 py-3 font-medium">Type</th>
                                    <th className="text-left px-4 py-3 font-medium">Description</th>
                                    <th className="text-left px-4 py-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                            No transactions yet
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="border-t hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{tx.userName || tx.userId}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-red-600"
                                                        }`}
                                                >
                                                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                                                {tx.description || "—"}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Adjust Credits Modal */}
            {adjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-background border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-bold">
                            Adjust Credits for {adjustModal.name || adjustModal.email}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Current balance: <strong>🪙 {adjustModal.credits}</strong>
                        </p>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Amount (+ to add, - to deduct)
                            </label>
                            <input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                placeholder="e.g. 50 or -25"
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Reason *</label>
                            <input
                                type="text"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                placeholder="e.g. Promotional bonus, Refund, etc."
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setAdjustModal(null);
                                    setAdjustAmount("");
                                    setAdjustReason("");
                                }}
                                className="px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdjust}
                                disabled={isPending || !adjustAmount || !adjustReason.trim()}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isPending ? "Saving..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
