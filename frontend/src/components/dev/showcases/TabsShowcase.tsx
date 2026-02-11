"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Bell, Settings, User } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ShowcaseItem } from "../ShowcaseItem";

// Shared tab trigger styles
const underlineTriggerStyles =
    "bg-transparent border-0 rounded-none px-4 py-2.5 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted transition-colors";

const filledTriggerStyles =
    "border-0 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-none hover:text-foreground hover:bg-muted transition-colors duration-200";

export function TabsShowcase() {
    return (
        <ShowcaseItem
            title="Tabs"
            description="Tabbed navigation for switching between content panels"
        >
            <div className="space-y-8">
                {/* Underline Style */}
                <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Underline Style</h3>

                    {/* Basic */}
                    <UnderlineTabsBasic />

                    {/* With Icons */}
                    <UnderlineTabsWithIcons />

                    {/* With Disabled */}
                    <UnderlineTabsWithDisabled />
                </div>

                {/* Filled Style */}
                <div className="space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Filled Style</h3>

                    {/* Basic */}
                    <FilledTabsBasic />

                    {/* With Icons */}
                    <FilledTabsWithIcons />

                    {/* With Disabled */}
                    <FilledTabsWithDisabled />
                </div>
            </div>
        </ShowcaseItem>
    );
}

// ============================================
// Underline Style Components
// ============================================

function UnderlineTabsBasic() {
    const [activeTab, setActiveTab] = useState("overview");
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    const tabs = [
        { name: "Overview", value: "overview" },
        { name: "Details", value: "details" },
        { name: "Settings", value: "settings" },
    ];

    useLayoutEffect(() => {
        const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
        const activeTabElement = tabRefs.current[activeIndex];

        if (activeTabElement) {
            const { offsetLeft, offsetWidth } = activeTabElement;
            setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
        }
    }, [activeTab]);

    return (
        <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
            <div className="w-full max-w-md">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
                    <TabsList className="bg-transparent relative rounded-none border-b border-border p-0 gap-0">
                        {tabs.map((tab, index) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                ref={(el) => {
                                    tabRefs.current[index] = el;
                                }}
                                className={underlineTriggerStyles}
                            >
                                {tab.name}
                            </TabsTrigger>
                        ))}
                        <motion.div
                            className="bg-primary absolute bottom-0 h-0.5 rounded-full"
                            initial={false}
                            animate={{ left: underlineStyle.left, width: underlineStyle.width }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        />
                    </TabsList>
                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <p className="text-muted-foreground text-sm">Content for {tab.name}</p>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

function UnderlineTabsWithIcons() {
    const [activeTab, setActiveTab] = useState("profile");
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    const tabs = [
        { name: "Profile", value: "profile", icon: User },
        { name: "Settings", value: "settings", icon: Settings },
        { name: "Notifications", value: "notifications", icon: Bell },
    ];

    useLayoutEffect(() => {
        const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
        const activeTabElement = tabRefs.current[activeIndex];

        if (activeTabElement) {
            const { offsetLeft, offsetWidth } = activeTabElement;
            setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
        }
    }, [activeTab]);

    return (
        <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">With Icons</h4>
            <div className="w-full max-w-md">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
                    <TabsList className="bg-transparent relative rounded-none border-b border-border p-0 gap-0">
                        {tabs.map((tab, index) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                ref={(el) => {
                                    tabRefs.current[index] = el;
                                }}
                                className={underlineTriggerStyles}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.name}
                            </TabsTrigger>
                        ))}
                        <motion.div
                            className="bg-primary absolute bottom-0 h-0.5 rounded-full"
                            initial={false}
                            animate={{ left: underlineStyle.left, width: underlineStyle.width }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        />
                    </TabsList>
                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <p className="text-muted-foreground text-sm">{tab.name} content</p>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

function UnderlineTabsWithDisabled() {
    const [activeTab, setActiveTab] = useState("active");
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    const tabs = [
        { name: "Active", value: "active", disabled: false },
        { name: "Disabled", value: "disabled", disabled: true },
        { name: "Another", value: "another", disabled: false },
    ];

    useLayoutEffect(() => {
        const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
        const activeTabElement = tabRefs.current[activeIndex];

        if (activeTabElement) {
            const { offsetLeft, offsetWidth } = activeTabElement;
            setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
        }
    }, [activeTab]);

    return (
        <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">With Disabled</h4>
            <div className="w-full max-w-md">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
                    <TabsList className="bg-transparent relative rounded-none border-b border-border p-0 gap-0">
                        {tabs.map((tab, index) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                disabled={tab.disabled}
                                ref={(el) => {
                                    tabRefs.current[index] = el;
                                }}
                                className={underlineTriggerStyles}
                            >
                                {tab.name}
                            </TabsTrigger>
                        ))}
                        <motion.div
                            className="bg-primary absolute bottom-0 h-0.5 rounded-full"
                            initial={false}
                            animate={{ left: underlineStyle.left, width: underlineStyle.width }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        />
                    </TabsList>
                    {tabs
                        .filter((tab) => !tab.disabled)
                        .map((tab) => (
                            <TabsContent key={tab.value} value={tab.value}>
                                <p className="text-muted-foreground text-sm">
                                    {tab.name} tab content
                                </p>
                            </TabsContent>
                        ))}
                </Tabs>
            </div>
        </div>
    );
}

// ============================================
// Filled Style Components
// ============================================

function FilledTabsBasic() {
    const tabs = [
        { name: "Overview", value: "overview" },
        { name: "Details", value: "details" },
        { name: "Settings", value: "settings" },
    ];

    return (
        <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
            <div className="w-full max-w-md">
                <Tabs defaultValue="overview" className="gap-4">
                    <TabsList className="bg-muted/50 gap-1 p-1 border-0">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={filledTriggerStyles}
                            >
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <p className="text-muted-foreground text-sm">Content for {tab.name}</p>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

function FilledTabsWithIcons() {
    const tabs = [
        { name: "Profile", value: "profile", icon: User },
        { name: "Settings", value: "settings", icon: Settings },
        { name: "Notifications", value: "notifications", icon: Bell },
    ];

    return (
        <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">With Icons</h4>
            <div className="w-full max-w-md">
                <Tabs defaultValue="profile" className="gap-4">
                    <TabsList className="bg-muted/50 gap-1 p-1 border-0">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={filledTriggerStyles}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <p className="text-muted-foreground text-sm">{tab.name} content</p>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

function FilledTabsWithDisabled() {
    const tabs = [
        { name: "Active", value: "active", disabled: false },
        { name: "Disabled", value: "disabled", disabled: true },
        { name: "Another", value: "another", disabled: false },
    ];

    return (
        <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">With Disabled</h4>
            <div className="w-full max-w-md">
                <Tabs defaultValue="active" className="gap-4">
                    <TabsList className="bg-muted/50 gap-1 p-1 border-0">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                disabled={tab.disabled}
                                className={filledTriggerStyles}
                            >
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs
                        .filter((tab) => !tab.disabled)
                        .map((tab) => (
                            <TabsContent key={tab.value} value={tab.value}>
                                <p className="text-muted-foreground text-sm">
                                    {tab.name} tab content
                                </p>
                            </TabsContent>
                        ))}
                </Tabs>
            </div>
        </div>
    );
}
