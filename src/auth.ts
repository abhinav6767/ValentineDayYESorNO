import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import { users, creditTransactions } from "./db/schema"
import { eq, sql } from "drizzle-orm"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db) as any,
    providers: [Google],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                // Always fetch latest role from DB to reflect admin changes immediately
                const [dbUser] = await db
                    .select({ role: users.role })
                    .from(users)
                    .where(eq(users.id, user.id))
                    .limit(1)
                session.user.role = dbUser?.role || "USER"
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            // Grant 25 free credits on first signup
            if (user.id) {
                await db
                    .update(users)
                    .set({ credits: 25 })
                    .where(eq(users.id, user.id));

                await db.insert(creditTransactions).values({
                    userId: user.id,
                    amount: 25,
                    type: "signup_bonus",
                    description: "Welcome bonus — 25 free credits!",
                });
            }
        },
    },
})

