import { ReactNode } from "react";

interface ShowcaseSectionProps {
    id: string;
    title: string;
    children: ReactNode;
}

export function ShowcaseSection({ id, title, children }: ShowcaseSectionProps) {
    return (
        <section id={id} className="scroll-mt-32">
            <h2 className="text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border">
                {title}
            </h2>
            <div className="space-y-12">{children}</div>
        </section>
    );
}
