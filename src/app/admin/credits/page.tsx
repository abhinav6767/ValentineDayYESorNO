import { db } from "@/db";
import { users, creditTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import CreditsManager from "./credits-manager";

export default async function AdminCreditsPage() {
    const allUsers = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
            role: users.role,
            credits: users.credits,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    const recentTransactions = await db
        .select({
            id: creditTransactions.id,
            userId: creditTransactions.userId,
            amount: creditTransactions.amount,
            type: creditTransactions.type,
            description: creditTransactions.description,
            createdAt: creditTransactions.createdAt,
            userName: users.name,
        })
        .from(creditTransactions)
        .leftJoin(users, eq(creditTransactions.userId, users.id))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(50);

    const formattedUsers = allUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        credits: u.credits,
        createdAt: u.createdAt?.toISOString() || "",
    }));

    const formattedTransactions = recentTransactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        amount: t.amount,
        type: t.type as string,
        description: t.description,
        createdAt: t.createdAt?.toISOString() || "",
        userName: t.userName,
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Credits Management</h1>
                <p className="text-muted-foreground mt-1">
                    View user credits, transaction history, and manually adjust balances.
                </p>
            </div>

            <CreditsManager users={formattedUsers} transactions={formattedTransactions} />
        </div>
    );
}
