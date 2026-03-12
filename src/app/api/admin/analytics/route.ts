import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toDateKey(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function getDateRange(days: number): { from: Date; to: Date } {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return { from, to };
}

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return null;
    return session;
}

export async function GET(req: Request) {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const daysParam = searchParams.get("days");
        const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30;
        const { from, to } = getDateRange(days);

        const legalProduct = await prisma.product.findUnique({ where: { slug: "legal-toolkit" } });
        const legalProductId = legalProduct?.id ?? null;

        const [
            totalUsers,
            emailVerifiedUsers,
            activeTrialUsers,
            expiredTrialUsers,
            trialConvertedUsers,
            activeSubscriptions,
            newUsersThisMonth,
            allUsersInRange,
            trialStartsInRange,
            subscriptionsInRange,
            toolUsagesInRange,
            allToolUsages,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "customer" } }),
            prisma.user.count({ where: { role: "customer", emailVerified: true } }),
            prisma.user.count({ where: { role: "customer", trialStatus: "active" } }),
            prisma.user.count({ where: { role: "customer", trialStatus: "expired" } }),
            prisma.user.count({
                where: {
                    role: "customer",
                    trialStartedAt: { not: null },
                    subscriptions: {
                        some: {
                            status: "active",
                            ...(legalProductId ? { productId: legalProductId } : {}),
                        },
                    },
                },
            }),
            prisma.subscription.count({
                where: {
                    status: "active",
                    ...(legalProductId ? { productId: legalProductId } : {}),
                },
            }),
            prisma.user.count({
                where: {
                    role: "customer",
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma.user.findMany({
                where: { role: "customer", createdAt: { gte: from, lte: to } },
                select: { id: true, createdAt: true },
            }),
            prisma.user.findMany({
                where: { role: "customer", trialStartedAt: { gte: from, lte: to } },
                select: { id: true, trialStartedAt: true, name: true, email: true },
            }),
            prisma.subscription.findMany({
                where: {
                    status: "active",
                    createdAt: { gte: from, lte: to },
                    ...(legalProductId ? { productId: legalProductId } : {}),
                },
                include: { user: { select: { id: true, trialStartedAt: true, name: true, email: true } } },
            }),
            prisma.toolUsage.findMany({
                where: { createdAt: { gte: from, lte: to } },
                select: { toolSlug: true, createdAt: true, userId: true },
            }),
            prisma.toolUsage.groupBy({
                by: ["toolSlug"],
                _count: { id: true },
                orderBy: { _count: { id: "desc" } },
            }),
        ]);

        const trialEverCount = activeTrialUsers + expiredTrialUsers + trialConvertedUsers;
        const conversionRate = trialEverCount > 0 ? Math.round((trialConvertedUsers / trialEverCount) * 100) : 0;

        const dailySignups: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(from);
            d.setDate(d.getDate() + i);
            dailySignups[toDateKey(d)] = 0;
        }
        for (const u of allUsersInRange) {
            const k = toDateKey(u.createdAt);
            if (dailySignups[k] !== undefined) dailySignups[k]++;
        }

        const dailyTrialStarts: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(from);
            d.setDate(d.getDate() + i);
            dailyTrialStarts[toDateKey(d)] = 0;
        }
        for (const u of trialStartsInRange) {
            if (u.trialStartedAt) {
                const k = toDateKey(u.trialStartedAt);
                if (dailyTrialStarts[k] !== undefined) dailyTrialStarts[k]++;
            }
        }

        const conversionsWithTrial = subscriptionsInRange.filter((s) => s.user.trialStartedAt != null);
        const dailyConversions: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(from);
            d.setDate(d.getDate() + i);
            dailyConversions[toDateKey(d)] = 0;
        }
        for (const s of conversionsWithTrial) {
            const k = toDateKey(s.createdAt);
            if (dailyConversions[k] !== undefined) dailyConversions[k]++;
        }

        const toolUsageByDay: Record<string, Record<string, number>> = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(from);
            d.setDate(d.getDate() + i);
            toolUsageByDay[toDateKey(d)] = {};
        }
        for (const t of toolUsagesInRange) {
            const k = toDateKey(t.createdAt);
            if (toolUsageByDay[k]) {
                toolUsageByDay[k][t.toolSlug] = (toolUsageByDay[k][t.toolSlug] ?? 0) + 1;
            }
        }

        const funnel = await Promise.all([
            prisma.user.count({ where: { role: "customer" } }),
            prisma.user.count({ where: { role: "customer", emailVerified: true } }),
            prisma.user.count({ where: { role: "customer", trialStartedAt: { not: null } } }),
            prisma.user.count({
                where: { role: "customer", trialOperationsUsed: { gt: 0 } },
            }),
            prisma.user.count({
                where: {
                    role: "customer",
                    subscriptions: {
                        some: {
                            status: "active",
                            ...(legalProductId ? { productId: legalProductId } : {}),
                        },
                    },
                },
            }),
        ]);

        const activeUsersByToolCount = await prisma.toolUsage.groupBy({
            by: ["userId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        });
        const userIds = activeUsersByToolCount.map((u) => u.userId);
        const usersMap = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
        }).then((list) => Object.fromEntries(list.map((u) => [u.id, u])));

        const mostActiveUsers = activeUsersByToolCount.map((u) => ({
            userId: u.userId,
            name: usersMap[u.userId]?.name ?? null,
            email: usersMap[u.userId]?.email ?? null,
            toolUsageCount: u._count.id,
        }));

        const recentTrialStarts = trialStartsInRange
            .filter((u) => u.trialStartedAt)
            .sort((a, b) => (b.trialStartedAt!.getTime() - a.trialStartedAt!.getTime()))
            .slice(0, 10)
            .map((u) => ({
                userId: u.id,
                name: u.name,
                email: u.email,
                trialStartedAt: u.trialStartedAt!.toISOString(),
            }));

        const recentConversions = conversionsWithTrial
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10)
            .map((s) => ({
                userId: s.user.id,
                name: s.user.name,
                email: s.user.email,
                convertedAt: s.createdAt.toISOString(),
            }));

        const dailySignupsArr = Object.entries(dailySignups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        const dailyTrialStartsArr = Object.entries(dailyTrialStarts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        const dailyConversionsArr = Object.entries(dailyConversions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        const toolUsageByDayArr = Object.entries(toolUsageByDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .flatMap(([date, byTool]) =>
                Object.entries(byTool).map(([toolSlug, count]) => ({ date, toolSlug, count }))
            );

        return NextResponse.json({
            days,
            kpis: {
                totalUsers,
                emailVerifiedUsers,
                activeTrialUsers,
                expiredTrialUsers,
                trialConvertedUsers,
                conversionRate,
                activeSubscriptions,
                newUsersThisMonth,
            },
            funnel: {
                registered: funnel[0],
                emailVerified: funnel[1],
                trialStarted: funnel[2],
                trialUsed: funnel[3],
                purchased: funnel[4],
            },
            dailySignups: dailySignupsArr,
            dailyTrialStarts: dailyTrialStartsArr,
            dailyConversions: dailyConversionsArr,
            mostUsedTools: allToolUsages.map((t) => ({ toolSlug: t.toolSlug, count: t._count.id })),
            toolUsageByDay: toolUsageByDayArr,
            mostActiveUsers,
            recentTrialStarts,
            recentConversions,
        });
    } catch (error) {
        console.error("[analytics] Error:", error);
        return NextResponse.json({ error: "Analitik verileri alınamadı." }, { status: 500 });
    }
}
