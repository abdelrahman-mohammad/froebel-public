"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ShowcaseItem } from "../ShowcaseItem";

export function AvatarShowcase() {
    return (
        <ShowcaseItem title="Avatar" description="User profile images with fallback support">
            <div className="space-y-6">
                {/* Basic Examples */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Basic Examples
                    </h4>
                    <div className="flex flex-wrap items-center gap-4">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
                            <AvatarFallback>VC</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="@anthropic" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Fallback States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Fallback States
                    </h4>
                    <div className="flex flex-wrap items-center gap-4">
                        <Avatar>
                            <AvatarImage src="/invalid-url.jpg" alt="Invalid" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                RQ
                            </AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarFallback className="bg-destructive text-destructive-foreground">
                                !
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Custom Sizes</h4>
                    <div className="flex flex-wrap items-end gap-4">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src="https://github.com/shadcn.png" alt="XS" />
                            <AvatarFallback className="text-xs">XS</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://github.com/shadcn.png" alt="SM" />
                            <AvatarFallback className="text-xs">SM</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="MD" />
                            <AvatarFallback>MD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-14 w-14">
                            <AvatarImage src="https://github.com/shadcn.png" alt="LG" />
                            <AvatarFallback className="text-lg">LG</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="https://github.com/shadcn.png" alt="XL" />
                            <AvatarFallback className="text-2xl">XL</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Avatar Group */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Avatar Group</h4>
                    <div className="flex -space-x-3">
                        <Avatar className="border-2 border-background">
                            <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
                            <AvatarFallback>U1</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-background">
                            <AvatarImage src="https://github.com/vercel.png" alt="User 2" />
                            <AvatarFallback>U2</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-background">
                            <AvatarImage src="https://github.com/shadcn.png" alt="User 3" />
                            <AvatarFallback>U3</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-background">
                            <AvatarFallback className="bg-muted">+5</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
