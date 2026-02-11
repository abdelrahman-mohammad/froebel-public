import { Providers } from "@/components/layout/Providers";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Toaster } from "@/components/ui/sonner";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            <SidebarLayout>{children}</SidebarLayout>
            <Toaster position="top-center" richColors closeButton />
        </Providers>
    );
}
