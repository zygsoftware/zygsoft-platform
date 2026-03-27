import type { DefaultSession, NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type AuthUserPayload = {
    id: string;
    email: string | null;
    role: string;
    emailVerified: boolean;
    trialStatus: string;
    trialEndsAt: Date | null;
    trialOperationsUsed: number;
    trialOperationsLimit: number;
    onboardingCompleted: boolean;
};

type SessionUser = DefaultSession["user"] & {
    id: string;
    role?: string;
    phone?: string | null;
    company?: string | null;
    emailVerified?: boolean;
    trialStatus?: string;
    trialStartedAt?: Date | null;
    trialEndsAt?: Date | null;
    trialOperationsUsed?: number;
    trialOperationsLimit?: number;
    onboardingCompleted?: boolean;
    subscriptions?: Array<{
        status: string;
        endsAt: Date | null;
        product: { slug: string };
    }>;
    activeProductSlugs?: string[];
};

type AppSession = DefaultSession & {
    user: SessionUser;
};

type AppToken = {
    id?: string;
    role?: string;
    emailVerified?: boolean;
    trialStatus?: string;
    trialStartedAt?: Date | null;
    trialEndsAt?: Date | null;
    trialOperationsUsed?: number;
    trialOperationsLimit?: number;
    onboardingCompleted?: boolean;
};

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const normalizedEmail = credentials.email.trim().toLowerCase();

                const user = await prisma.user.findUnique({
                    where: { email: normalizedEmail },
                });

                if (!user || user.status !== "active") {
                    return null;
                }

                if (user.role === "customer" && !user.emailVerified) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user?.password || "");
                if (user && isValid) {
                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        emailVerified: user.emailVerified,
                        trialStatus: user.trialStatus,
                        trialEndsAt: user.trialEndsAt,
                        trialOperationsUsed: user.trialOperationsUsed,
                        trialOperationsLimit: user.trialOperationsLimit,
                        onboardingCompleted: user.onboardingCompleted ?? false,
                    };
                }

                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            const appToken = token as typeof token & AppToken;
            const authUser = user as AuthUserPayload | undefined;

            if (user) {
                appToken.id = authUser?.id;
                appToken.role = authUser?.role;
                appToken.emailVerified = authUser?.emailVerified;
                appToken.trialStatus = authUser?.trialStatus;
                appToken.trialEndsAt = authUser?.trialEndsAt;
                appToken.trialOperationsUsed = authUser?.trialOperationsUsed;
                appToken.trialOperationsLimit = authUser?.trialOperationsLimit;
                appToken.onboardingCompleted = authUser?.onboardingCompleted ?? false;
            }
            return appToken;
        },
        async session({ session, token }) {
            const appSession = session as AppSession;
            const appToken = token as typeof token & AppToken;

            if (appSession.user && appToken.id) {
                appSession.user.id = appToken.id;
                appSession.user.role = appToken.role;

                // Fetch fresh user data (emailVerified, trial, subscriptions)
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: appToken.id },
                        select: {
                            name: true,
                            email: true,
                            phone: true,
                            company: true,
                            emailVerified: true,
                            trialStatus: true,
                            trialStartedAt: true,
                            trialEndsAt: true,
                            trialOperationsUsed: true,
                            trialOperationsLimit: true,
                            onboardingCompleted: true,
                        },
                    });
                    appSession.user.name = dbUser?.name ?? appSession.user?.name ?? null;
                    appSession.user.email = dbUser?.email ?? appSession.user?.email ?? null;
                    appSession.user.phone = dbUser?.phone ?? null;
                    appSession.user.company = dbUser?.company ?? null;
                    appSession.user.emailVerified = dbUser?.emailVerified ?? false;
                    appSession.user.trialStatus = dbUser?.trialStatus ?? "none";
                    appSession.user.trialStartedAt = dbUser?.trialStartedAt ?? null;
                    appSession.user.trialEndsAt = dbUser?.trialEndsAt ?? null;
                    appSession.user.trialOperationsUsed = dbUser?.trialOperationsUsed ?? 0;
                    appSession.user.trialOperationsLimit = dbUser?.trialOperationsLimit ?? 20;
                    appSession.user.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
                } catch {
                    appSession.user.emailVerified = appToken.emailVerified ?? false;
                    appSession.user.trialStatus = appToken.trialStatus ?? "none";
                    appSession.user.trialStartedAt = appToken.trialStartedAt ?? null;
                    appSession.user.trialEndsAt = appToken.trialEndsAt ?? null;
                    appSession.user.trialOperationsUsed = appToken.trialOperationsUsed ?? 0;
                    appSession.user.trialOperationsLimit = appToken.trialOperationsLimit ?? 20;
                    appSession.user.onboardingCompleted = appToken.onboardingCompleted ?? false;
                }

                // Fetch fresh subscriptions from DB
                try {
                    const subscriptions = await prisma.subscription.findMany({
                        where: { userId: appToken.id },
                        include: { product: true }
                    });

                    appSession.user.subscriptions = subscriptions;
                    // Active slugs: status must be "active" AND subscription must not be expired
                    const now = new Date();
                    appSession.user.activeProductSlugs = subscriptions
                        .filter((sub) => {
                            if (sub.status !== "active") return false;
                            if (sub.endsAt && new Date(sub.endsAt) < now) return false;
                            return true;
                        })
                        .map((sub) => sub.product.slug);

                } catch {
                    appSession.user.subscriptions = [];
                    appSession.user.activeProductSlugs = [];
                }
            }
            return appSession;
        },
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
