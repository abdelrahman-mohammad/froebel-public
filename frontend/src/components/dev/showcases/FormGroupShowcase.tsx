"use client";

import { FormError, FormGroup, FormHint, FormLabel } from "@/components/ui/form-group";
import { Input } from "@/components/ui/input";

import { ShowcaseItem } from "../ShowcaseItem";

export function FormGroupShowcase() {
    return (
        <ShowcaseItem
            title="Form Group"
            description="Form field wrapper with label, hint, and error support"
        >
            <div className="space-y-6 max-w-md">
                {/* Basic with Label */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Basic with Label
                    </h4>
                    <FormGroup label="Email Address" htmlFor="email1">
                        <Input id="email1" type="email" placeholder="Enter your email" />
                    </FormGroup>
                </div>

                {/* Required Field */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Required Field
                    </h4>
                    <FormGroup label="Username" htmlFor="username" required>
                        <Input id="username" placeholder="Enter username" />
                    </FormGroup>
                </div>

                {/* With Hint */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Hint</h4>
                    <FormGroup
                        label="Password"
                        htmlFor="password"
                        hint="Must be at least 8 characters"
                    >
                        <Input id="password" type="password" placeholder="Enter password" />
                    </FormGroup>
                </div>

                {/* With Error */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        With Error (using FormError)
                    </h4>
                    <div className="space-y-2">
                        <FormLabel htmlFor="email-error" required>
                            Email
                        </FormLabel>
                        <Input
                            id="email-error"
                            type="email"
                            placeholder="Enter email"
                            aria-invalid="true"
                        />
                        <FormError>Please enter a valid email address</FormError>
                    </div>
                </div>

                {/* Spacing Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Spacing Variants (bottom margin between form groups)
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                        Each colored box shows a FormGroup. The gap below each box is the spacing
                        variant.
                    </p>
                    <div className="border border-dashed border-border p-4 rounded-lg bg-muted/30">
                        <FormGroup
                            label="Small spacing (mb-3 = 12px)"
                            spacing="sm"
                            className="bg-primary/10 p-2 rounded"
                        >
                            <Input placeholder="sm" />
                        </FormGroup>
                        <FormGroup
                            label="Default spacing (mb-5 = 20px)"
                            spacing="default"
                            className="bg-primary/10 p-2 rounded"
                        >
                            <Input placeholder="default" />
                        </FormGroup>
                        <FormGroup
                            label="Large spacing (mb-6 = 24px)"
                            spacing="lg"
                            className="bg-primary/10 p-2 rounded"
                        >
                            <Input placeholder="lg" />
                        </FormGroup>
                        <FormGroup
                            label="No spacing (mb-0)"
                            spacing="none"
                            className="bg-primary/10 p-2 rounded"
                        >
                            <Input placeholder="none" />
                        </FormGroup>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
