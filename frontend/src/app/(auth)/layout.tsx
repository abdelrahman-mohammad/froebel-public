import { Providers } from "@/components/layout/Providers";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            {children}
            <Toaster position="top-center" richColors closeButton />
        </Providers>
    );
}
