import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

type SubscriptionSummary = {
    status: string;
    endsAt: Date | null;
    product: {
        slug: string;
    };
};

declare module "next-auth" {
    interface Session {
        user: DefaultSession["user"] & {
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
            subscriptions?: SubscriptionSummary[];
            activeProductSlugs?: string[];
        };
    }

    interface User {
        id: string;
        role?: string;
        emailVerified?: boolean;
        trialStatus?: string;
        trialStartedAt?: Date | null;
        trialEndsAt?: Date | null;
        trialOperationsUsed?: number;
        trialOperationsLimit?: number;
        onboardingCompleted?: boolean;
        status?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id?: string;
        role?: string;
        emailVerified?: boolean;
        trialStatus?: string;
        trialStartedAt?: Date | null;
        trialEndsAt?: Date | null;
        trialOperationsUsed?: number;
        trialOperationsLimit?: number;
        onboardingCompleted?: boolean;
    }
}
