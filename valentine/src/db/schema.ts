import { pgTable, serial, text, timestamp, boolean, uuid, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").$type<"USER" | "ADMIN">().default("USER"),
    credits: integer("credits").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({ columns: [account.provider, account.providerAccountId] }),
    ]
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({ columns: [verificationToken.identifier, verificationToken.token] }),
    ]
);

export const templates = pgTable("templates", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").default(0).notNull(), // stored in cents/paise
    salePrice: integer("sale_price"),
    thumbnail: text("thumbnail"),
    tags: text("tags").array(),
    files: text("files").notNull(), // Path to the component
    fields: jsonb("fields"), // Schema for customization fields
    isPublic: boolean("is_public").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

export const pages = pgTable("pages", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id),
    templateId: integer("template_id").references(() => templates.id),
    content: jsonb("content").notNull(), // customization data
    slug: text("slug").unique().notNull(), // public shareable id
    isPaid: boolean("is_paid").default(false),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id),
    amount: integer("amount").notNull(),
    status: text("status").notNull(), // pending, paid, failed
    paymentId: text("payment_id"), // razorpay_payment_id
    orderId: text("order_id"), // razorpay_order_id
    pageId: uuid("page_id").references(() => pages.id),
    createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    text: text("text"),
    rating: integer("rating").notNull(), // 1-5 stars
    role: text("role"), // optional: e.g. "Designer", "Developer"
    videoUrl: text("video_url"), // optional video URL
    status: text("status").$type<"pending" | "approved" | "rejected">().default("approved").notNull(),
    creditsAwarded: integer("credits_awarded").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    amount: integer("amount").notNull(), // positive = credit, negative = debit
    type: text("type").$type<"signup_bonus" | "review_reward" | "purchase" | "spend">().notNull(),
    description: text("description"),
    referenceId: text("reference_id"), // review id, order id, etc.
    createdAt: timestamp("created_at").defaultNow(),
});

