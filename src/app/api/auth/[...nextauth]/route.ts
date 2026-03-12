import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
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

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // Simplified for testing; in production, use bcrypt here
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
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.emailVerified = (user as any).emailVerified;
                token.trialStatus = (user as any).trialStatus;
                token.trialEndsAt = (user as any).trialEndsAt;
                token.trialOperationsUsed = (user as any).trialOperationsUsed;
                token.trialOperationsLimit = (user as any).trialOperationsLimit;
                token.onboardingCompleted = (user as any).onboardingCompleted ?? false;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;

                // Fetch fresh user data (emailVerified, trial, subscriptions)
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id },
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
                    (session.user as any).name = dbUser?.name ?? session.user?.name ?? null;
                    (session.user as any).email = dbUser?.email ?? session.user?.email ?? null;
                    (session.user as any).phone = dbUser?.phone ?? null;
                    (session.user as any).company = dbUser?.company ?? null;
                    (session.user as any).emailVerified = dbUser?.emailVerified ?? false;
                    (session.user as any).trialStatus = dbUser?.trialStatus ?? "none";
                    (session.user as any).trialStartedAt = dbUser?.trialStartedAt ?? null;
                    (session.user as any).trialEndsAt = dbUser?.trialEndsAt ?? null;
                    (session.user as any).trialOperationsUsed = dbUser?.trialOperationsUsed ?? 0;
                    (session.user as any).trialOperationsLimit = dbUser?.trialOperationsLimit ?? 20;
                    (session.user as any).onboardingCompleted = dbUser?.onboardingCompleted ?? false;
                } catch {
                    (session.user as any).emailVerified = token.emailVerified ?? false;
                    (session.user as any).trialStatus = token.trialStatus ?? "none";
                    (session.user as any).trialStartedAt = token.trialStartedAt ?? null;
                    (session.user as any).trialEndsAt = token.trialEndsAt ?? null;
                    (session.user as any).trialOperationsUsed = token.trialOperationsUsed ?? 0;
                    (session.user as any).trialOperationsLimit = token.trialOperationsLimit ?? 20;
                    (session.user as any).onboardingCompleted = token.onboardingCompleted ?? false;
                }

                // Fetch fresh subscriptions from DB
                try {
                    const subscriptions = await prisma.subscription.findMany({
                        where: { userId: token.id },
                        include: { product: true }
                    });

                    (session.user as any).subscriptions = subscriptions;
                    // Active slugs: status must be "active" AND subscription must not be expired
                    const now = new Date();
                    (session.user as any).activeProductSlugs = subscriptions
                        .filter((sub: any) => {
                            if (sub.status !== "active") return false;
                            if (sub.endsAt && new Date(sub.endsAt) < now) return false;
                            return true;
                        })
                        .map((sub: any) => sub.product.slug);

                } catch (e) {
                    (session.user as any).subscriptions = [];
                    (session.user as any).activeProductSlugs = [];
                }
            }
            return session;
        },
    },
    session: { strategy: "jwt" as any },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
