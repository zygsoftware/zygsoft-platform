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
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;

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
