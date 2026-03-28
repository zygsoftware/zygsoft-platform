"use client";

import nextDynamic from "next/dynamic";

const AdminLoginClient = nextDynamic(() => import("./AdminLoginClient"), {
    ssr: false,
});

export default function AdminLoginPage() {
    return <AdminLoginClient />;
}
