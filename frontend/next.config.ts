import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
        ],
    },
    async redirects() {
        return [
            // Dashboard -> Home
            {
                source: "/dashboard",
                destination: "/",
                permanent: true,
            },
            // My Quizzes -> Library
            {
                source: "/my-quizzes",
                destination: "/library",
                permanent: true,
            },
            // My Courses -> Library (courses tab)
            {
                source: "/my-courses",
                destination: "/library?type=courses",
                permanent: true,
            },
            // Browse -> Explore
            {
                source: "/browse",
                destination: "/explore",
                permanent: true,
            },
            // Search -> Explore with query
            {
                source: "/search",
                destination: "/explore",
                permanent: true,
            },
            // Create -> Library (quiz creation now happens via button click)
            {
                source: "/create",
                destination: "/library",
                permanent: true,
            },
            // Editor -> Library (quiz creation now happens via button click)
            {
                source: "/editor",
                destination: "/library",
                permanent: true,
            },
            // Editor with ID -> Quiz Edit
            {
                source: "/editor/:id",
                destination: "/quiz/:id/edit",
                permanent: true,
            },
            // Course Create -> Course New
            {
                source: "/course/create",
                destination: "/course/new",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
