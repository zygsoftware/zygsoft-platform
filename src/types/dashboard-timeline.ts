/** Matches GET /api/dashboard/timeline response `timeline` items. */

export type TimelinePaymentItem = {
    kind: "payment";
    id: string;
    status: "pending" | "approved" | "rejected";
    productName: string | null;
    amount: number;
    date: string;
};

export type TimelineTicketItem = {
    kind: "ticket";
    id: string;
    variant: "created" | "updated";
    subject: string;
    status: "open" | "in_progress" | "answered" | "closed";
    date: string;
};

export type TimelineToolItem = {
    kind: "tool";
    id: string;
    toolSlug: string;
    date: string;
};

export type TimelineItem = TimelinePaymentItem | TimelineTicketItem | TimelineToolItem;
