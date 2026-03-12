import { prisma } from "@/lib/prisma";

const TICKET_CODE_PREFIX = "ZYG-TS-";

/**
 * Generates the next ticket code in format ZYG-TS-000001.
 * Uses the highest existing numeric part + 1, or 1 if none exist.
 */
export async function generateTicketCode(): Promise<string> {
  const tickets = await prisma.supportTicket.findMany({
    where: { ticketCode: { not: null } },
    select: { ticketCode: true },
  });

  let maxNum = 0;
  for (const t of tickets) {
    const code = t.ticketCode;
    if (!code || !code.startsWith(TICKET_CODE_PREFIX)) continue;
    const num = parseInt(code.slice(TICKET_CODE_PREFIX.length), 10);
    if (!isNaN(num) && num > maxNum) maxNum = num;
  }

  const nextNum = maxNum + 1;
  return `${TICKET_CODE_PREFIX}${String(nextNum).padStart(6, "0")}`;
}

/**
 * Returns ticketCode or a fallback for legacy tickets without code.
 */
export function getDisplayTicketCode(ticket: { ticketCode: string | null; id: string }): string {
  return ticket.ticketCode ?? `ID-${ticket.id.slice(-8)}`;
}
