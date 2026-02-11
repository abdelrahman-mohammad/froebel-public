"use client";

import Image from "next/image";
import Link from "next/link";

import { BookOpen, Brain, FolderOpen, Sparkles } from "lucide-react";

interface AuthSplitLayoutProps {
    children: React.ReactNode;
}

interface FeatureItemProps {
    icon: React.ElementType;
    title: string;
    description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <h3 className="font-medium text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <Link href="/" className="inline-block group">
                            <Image
                                src="/logo.png"
                                alt="Froebel"
                                width={180}
                                height={45}
                                className="transition-transform group-hover:scale-105"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Form Content */}
                    {children}
                </div>
            </div>

            {/* Right Panel - Brand (hidden on mobile) */}
            <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>

                {/* Feature highlights content */}
                <div className="relative z-10 max-w-md p-8 space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground">
                            Learn smarter with Froebel
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            The AI-powered quiz platform for effective learning
                        </p>
                    </div>

                    <div className="space-y-6">
                        <FeatureItem
                            icon={Brain}
                            title="AI-Powered Grading"
                            description="Get instant feedback on essays and open-ended questions"
                        />
                        <FeatureItem
                            icon={BookOpen}
                            title="Create & Share Quizzes"
                            description="Build quizzes with 6+ question types and share with others"
                        />
                        <FeatureItem
                            icon={FolderOpen}
                            title="Organize into Courses"
                            description="Group related quizzes into structured learning paths"
                        />
                        <FeatureItem
                            icon={Sparkles}
                            title="Smart Memorization"
                            description="Flashcard mode with spaced repetition for effective learning"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
