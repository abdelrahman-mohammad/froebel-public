import { redirect } from "next/navigation";

import { ComponentShowcase } from "@/components/dev/ComponentShowcase";

export default function ComponentsPage() {
    // Redirect to home in production - this page is dev-only
    if (process.env.NODE_ENV === "production") {
        redirect("/");
    }

    return <ComponentShowcase />;
}

// Prevent page from being statically generated in production
export const dynamic = "force-dynamic";
