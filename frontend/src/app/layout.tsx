import type { Metadata } from "next";
import { Geist, Geist_Mono, Lilita_One } from "next/font/google";

import "./globals.css";

// Google Sans Flex font stylesheet URL
const googleSansFlexUrl =
    "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const lilitaOne = Lilita_One({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-lilita",
});

export const metadata: Metadata = {
    title: {
        template: "%s - Froebel",
        default: "Froebel",
    },
    description: "AI-powered quiz platform for learning and practice",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="stylesheet" href={googleSansFlexUrl} />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${lilitaOne.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
