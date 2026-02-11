"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { ShowcaseItem } from "../ShowcaseItem";

export function CardShowcase() {
    return (
        <ShowcaseItem
            title="Card"
            description="Container component with header, content, and footer sections"
        >
            <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Card</CardTitle>
                        <CardDescription>A simple card with title and description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            This is the card content area. You can put any content here.
                        </p>
                    </CardContent>
                </Card>

                {/* Card with Footer */}
                <Card>
                    <CardHeader>
                        <CardTitle>Card with Footer</CardTitle>
                        <CardDescription>Includes action buttons in the footer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Cards can have footers for actions like buttons.
                        </p>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button variant="secondary" size="sm">
                            Cancel
                        </Button>
                        <Button size="sm">Save</Button>
                    </CardFooter>
                </Card>

                {/* Card with Action */}
                <Card>
                    <CardHeader>
                        <CardTitle>Card with Action</CardTitle>
                        <CardDescription>Has an action button in the header</CardDescription>
                        <CardAction>
                            <Button variant="ghost" size="icon-sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            The CardAction component places an element in the header corner.
                        </p>
                    </CardContent>
                </Card>

                {/* Content-only Card */}
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                            A card can also have just content without a header or footer. This is
                            useful for simple content containers.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </ShowcaseItem>
    );
}
