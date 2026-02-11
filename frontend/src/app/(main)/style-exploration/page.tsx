"use client";

import { Sparkles, Heart, Zap, Star, Rocket, Gift, Music, Sun, Play, Check, ArrowRight, Plus, Trophy, Flame, Search, AlertCircle, Info, X, ChevronDown, Bell, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function StyleExplorationPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isToggled, setIsToggled] = useState(true);
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold mb-2">Playful Button Styles</h1>
                <p className="text-muted-foreground">
                    Click around and let me know which styles you like!
                </p>
            </div>

            <div className="space-y-16">
                {/* 1. Pill Buttons */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
                            1
                        </span>
                        Pill Buttons (Fully Rounded)
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Soft, friendly appearance - approachable and modern
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-2.5 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 active:bg-blue-700 transition-colors">
                            Primary Action
                        </button>
                        <button className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600 active:bg-pink-700 transition-colors">
                            Secondary
                        </button>
                        <button className="px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors border border-gray-200">
                            Outlined
                        </button>
                        <button className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                            Small
                        </button>
                        <button className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center hover:bg-violet-600 transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* 2. Bouncy 3D Buttons */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                            2
                        </span>
                        Bouncy 3D Buttons
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Raised appearance with satisfying press-down effect
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium shadow-[0_4px_0_0_#1d4ed8] hover:shadow-[0_2px_0_0_#1d4ed8] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                            Primary Action
                        </button>
                        <button className="px-6 py-2.5 rounded-lg bg-rose-500 text-white font-medium shadow-[0_4px_0_0_#be123c] hover:shadow-[0_2px_0_0_#be123c] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                            Secondary
                        </button>
                        <button className="px-6 py-2.5 rounded-lg bg-amber-400 text-amber-900 font-medium shadow-[0_4px_0_0_#b45309] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                            Warning
                        </button>
                        <button className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-medium shadow-[0_4px_0_0_#047857] hover:shadow-[0_2px_0_0_#047857] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                            Success
                        </button>
                        <button className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-[0_4px_0_0_#7e22ce] hover:shadow-[0_2px_0_0_#7e22ce] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                            <Zap className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* 3. Gradient Buttons */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                            3
                        </span>
                        Gradient Buttons
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Colorful gradients for eye-catching actions
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 transition-all shadow-lg shadow-blue-500/25">
                            Ocean Wave
                        </button>
                        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25">
                            Sunset Pink
                        </button>
                        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/25">
                            Purple Dream
                        </button>
                        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/25">
                            Warm Glow
                        </button>
                        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-medium hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
                            Fresh Mint
                        </button>
                    </div>
                </section>

                {/* 4. Soft/Pastel Buttons */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold">
                            4
                        </span>
                        Soft Pastel Buttons
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Light, airy colors - gentle and whimsical
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-2.5 rounded-xl bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 active:bg-blue-300 transition-colors border border-blue-200">
                            Sky Blue
                        </button>
                        <button className="px-6 py-2.5 rounded-xl bg-pink-100 text-pink-700 font-medium hover:bg-pink-200 active:bg-pink-300 transition-colors border border-pink-200">
                            Blush Pink
                        </button>
                        <button className="px-6 py-2.5 rounded-xl bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 active:bg-violet-300 transition-colors border border-violet-200">
                            Lavender
                        </button>
                        <button className="px-6 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200 active:bg-emerald-300 transition-colors border border-emerald-200">
                            Mint Green
                        </button>
                        <button className="px-6 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-medium hover:bg-amber-200 active:bg-amber-300 transition-colors border border-amber-200">
                            Peach
                        </button>
                    </div>
                </section>

                {/* 5. Bold Chunky Buttons */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                            5
                        </span>
                        Bold Chunky Buttons
                    </h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Thick borders and strong shadows - high energy
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-3 rounded-lg bg-yellow-400 text-black font-bold border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
                            BOLD ACTION
                        </button>
                        <button className="px-6 py-3 rounded-lg bg-cyan-400 text-black font-bold border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
                            ELECTRIC
                        </button>
                        <button className="px-6 py-3 rounded-lg bg-lime-400 text-black font-bold border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
                            NEON
                        </button>
                        <button className="px-6 py-3 rounded-lg bg-fuchsia-400 text-black font-bold border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
                            POP
                        </button>
                    </div>
                </section>

                {/* ========== BUBBLY CARTOON STYLE DEEP DIVE ========== */}
                <div className="border-t-4 border-dashed border-emerald-300 pt-12 mt-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
                            <span className="text-3xl">🎨</span>
                            Bubbly Cartoon Style - Deep Dive
                            <span className="text-3xl">🎨</span>
                        </h2>
                        <p className="text-muted-foreground">
                            Exploring variations of the comic-book aesthetic
                        </p>
                    </div>

                    {/* 6A. Original for reference */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6A. Original (Reference)</h3>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border-[3px] border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-blue-400 transition-all">
                                Original Style
                            </button>
                        </div>
                    </section>

                    {/* 6B. Border Thickness */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6B. Border Thickness</h3>
                        <p className="text-muted-foreground text-sm mb-4">Thin to thick borders</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-blue-400 transition-all">
                                1px Border
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border-2 border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-blue-400 transition-all">
                                2px Border
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border-[3px] border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-blue-400 transition-all">
                                3px Border
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border-4 border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-blue-400 transition-all">
                                4px Border
                            </button>
                        </div>
                    </section>

                    {/* 6C. Corner Roundness */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6C. Corner Roundness</h3>
                        <p className="text-muted-foreground text-sm mb-4">Sharp to fully rounded</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-md bg-rose-500 text-white font-bold border-[3px] border-rose-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-rose-400 transition-all">
                                Rounded-md
                            </button>
                            <button className="px-6 py-2.5 rounded-lg bg-rose-500 text-white font-bold border-[3px] border-rose-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-rose-400 transition-all">
                                Rounded-lg
                            </button>
                            <button className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold border-[3px] border-rose-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-rose-400 transition-all">
                                Rounded-xl
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-rose-500 text-white font-bold border-[3px] border-rose-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-rose-400 transition-all">
                                Rounded-2xl
                            </button>
                            <button className="px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold border-[3px] border-rose-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-rose-400 transition-all">
                                Pill Shape
                            </button>
                        </div>
                    </section>

                    {/* 6D. Inner Shadow Depth - CHOSEN: Subtle (-2px) */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6D. Inner Shadow Depth</h3>
                        <p className="text-muted-foreground text-sm mb-4">Chosen: Subtle -2px (static, no animation on press)</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-amber-500 text-white font-bold border-[3px] border-amber-700 hover:bg-amber-400 transition-all">
                                No Shadow
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-amber-500 text-white font-bold border-[3px] border-amber-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-amber-400 transition-all ring-2 ring-emerald-500 ring-offset-2">
                                Subtle (-2px) ✓
                            </button>
                        </div>
                    </section>

                    {/* 6E. Border Color Styles */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6E. Border Color Styles</h3>
                        <p className="text-muted-foreground text-sm mb-4">Same-hue dark vs black vs contrasting</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-violet-500 text-white font-bold border-[3px] border-violet-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-violet-400 transition-all">
                                Same-Hue Dark
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-violet-500 text-white font-bold border-[3px] border-black shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-violet-400 transition-all">
                                Black Border
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-violet-500 text-white font-bold border-[3px] border-fuchsia-300 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-violet-400 transition-all">
                                Light Accent
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-violet-500 text-white font-bold border-[3px] border-yellow-400 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-violet-400 transition-all">
                                Contrast Pop
                            </button>
                        </div>
                    </section>

                    {/* 6F. With External Shadow */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6F. With External Shadow</h3>
                        <p className="text-muted-foreground text-sm mb-4">Adding drop shadow for more depth</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold border-[3px] border-emerald-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_4px_0_0_#065f46] hover:bg-emerald-400 hover:translate-y-[2px] hover:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_2px_0_0_#065f46] active:translate-y-[4px] transition-all">
                                Bottom Shadow
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold border-[3px] border-emerald-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),4px_4px_0_0_#065f46] hover:bg-emerald-400 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),2px_2px_0_0_#065f46] active:translate-x-[4px] active:translate-y-[4px] transition-all">
                                Corner Shadow
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold border-[3px] border-emerald-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_6px_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_8px_25px_rgba(16,185,129,0.5)] transition-all">
                                Glow Shadow
                            </button>
                        </div>
                    </section>

                    {/* 6G. Color Palette */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6G. Color Palette</h3>
                        <p className="text-muted-foreground text-sm mb-4">Primary, secondary, success, warning, danger</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border-[3px] border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-blue-400 transition-all">
                                Primary
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-slate-500 text-white font-bold border-[3px] border-slate-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-slate-400 transition-all">
                                Secondary
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold border-[3px] border-emerald-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-emerald-400 transition-all">
                                Success
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-amber-500 text-white font-bold border-[3px] border-amber-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-amber-400 transition-all">
                                Warning
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-red-500 text-white font-bold border-[3px] border-red-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-red-400 transition-all">
                                Danger
                            </button>
                        </div>
                    </section>

                    {/* 6H. With Icons */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6H. With Icons</h3>
                        <p className="text-muted-foreground text-sm mb-4">Adding playful icons</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-green-500 text-white font-bold border-[3px] border-green-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-green-400 transition-all flex items-center gap-2">
                                <Play className="w-5 h-5 fill-current" />
                                Play Quiz
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border-[3px] border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-blue-400 transition-all flex items-center gap-2">
                                Next
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold border-[3px] border-emerald-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-emerald-400 transition-all flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Submit
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-amber-500 text-white font-bold border-[3px] border-amber-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-amber-400 transition-all flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                Leaderboard
                            </button>
                            <button className="w-11 h-11 rounded-2xl bg-rose-500 text-white font-bold border-[3px] border-rose-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-rose-400 transition-all flex items-center justify-center">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="w-11 h-11 rounded-2xl bg-violet-500 text-white font-bold border-[3px] border-violet-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-violet-400 transition-all flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </section>

                    {/* 6I. Sizes */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6I. Sizes</h3>
                        <p className="text-muted-foreground text-sm mb-4">Small to large</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-4 py-1.5 text-sm rounded-xl bg-cyan-500 text-white font-bold border-2 border-cyan-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-cyan-400 transition-all">
                                Small
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-cyan-500 text-white font-bold border-[3px] border-cyan-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-cyan-400 transition-all">
                                Medium
                            </button>
                            <button className="px-8 py-3.5 text-lg rounded-2xl bg-cyan-500 text-white font-bold border-4 border-cyan-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-cyan-400 transition-all">
                                Large
                            </button>
                            <button className="px-10 py-4 text-xl rounded-3xl bg-cyan-500 text-white font-bold border-4 border-cyan-800 shadow-[inset_0_-6px_0_0_rgba(0,0,0,0.2)] hover:bg-cyan-400 transition-all">
                                Extra Large
                            </button>
                        </div>
                    </section>

                    {/* 6J. Gradient Fills */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6J. Gradient Fills</h3>
                        <p className="text-muted-foreground text-sm mb-4">Gradient backgrounds with cartoon style</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-gradient-to-b from-pink-400 to-pink-600 text-white font-bold border-[3px] border-pink-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:from-pink-300 hover:to-pink-500 transition-all">
                                Top Gradient
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold border-[3px] border-red-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:from-orange-300 hover:to-red-400 transition-all flex items-center gap-2">
                                <Flame className="w-5 h-5" />
                                Fire
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-400 to-violet-500 text-white font-bold border-[3px] border-violet-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:from-blue-300 hover:to-violet-400 transition-all">
                                Cool Gradient
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-white font-bold border-[3px] border-cyan-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:from-emerald-300 hover:to-cyan-400 transition-all">
                                Fresh
                            </button>
                        </div>
                    </section>

                    {/* 6K. Ghost/Outline Variants */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6K. Ghost/Outline Variants</h3>
                        <p className="text-muted-foreground text-sm mb-4">Outlined versions for secondary actions</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-transparent text-blue-600 font-bold border-[3px] border-blue-500 hover:bg-blue-50 active:bg-blue-100 transition-all">
                                Ghost Blue
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-transparent text-rose-600 font-bold border-[3px] border-rose-500 hover:bg-rose-50 active:bg-rose-100 transition-all">
                                Ghost Rose
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-100 text-blue-700 font-bold border-[3px] border-blue-400 shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.1)] hover:bg-blue-200 transition-all">
                                Soft Blue
                            </button>
                            <button className="px-6 py-2.5 rounded-2xl bg-rose-100 text-rose-700 font-bold border-[3px] border-rose-400 shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.1)] hover:bg-rose-200 transition-all">
                                Soft Rose
                            </button>
                        </div>
                    </section>

                    {/* 6L. Disabled States */}
                    <section className="mb-12">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-600">6L. Disabled States</h3>
                        <p className="text-muted-foreground text-sm mb-4">How disabled buttons should look</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button className="px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold border-[3px] border-blue-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] transition-all">
                                Active
                            </button>
                            <button disabled className="px-6 py-2.5 rounded-2xl bg-gray-300 text-gray-500 font-bold border-[3px] border-gray-400 cursor-not-allowed">
                                Disabled
                            </button>
                            <button disabled className="px-6 py-2.5 rounded-2xl bg-blue-300 text-blue-100 font-bold border-[3px] border-blue-400 cursor-not-allowed opacity-60">
                                Disabled (tinted)
                            </button>
                        </div>
                    </section>

                    {/* 6M. My Favorites (Recommendations) */}
                    <section className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 dark:from-emerald-950/30 dark:to-cyan-950/30 dark:border-emerald-800">
                        <h3 className="text-lg font-semibold mb-3 text-emerald-700 flex items-center gap-2">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            Recommended Combinations
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">Based on playfulness + usability</p>
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Combo 1: Rounded-xl, 3px border, medium shadow, same-hue dark */}
                            <button className="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-bold border-[3px] border-blue-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_4px_0_0_#1e40af] hover:bg-blue-400 hover:translate-y-[2px] hover:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_2px_0_0_#1e40af] active:translate-y-[4px] transition-all">
                                Combo A
                            </button>
                            {/* Combo 2: Pill, 2px border, subtle shadow */}
                            <button className="px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold border-2 border-rose-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-rose-400 transition-all">
                                Combo B
                            </button>
                            {/* Combo 3: Rounded-2xl, black border, deep shadow */}
                            <button className="px-6 py-2.5 rounded-2xl bg-amber-400 text-black font-bold border-[3px] border-black shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)] hover:bg-amber-300 transition-all">
                                Combo C
                            </button>
                            {/* Combo 4: Gradient + external shadow */}
                            <button className="px-6 py-2.5 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white font-bold border-[3px] border-emerald-800 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_4px_0_0_#065f46] hover:from-emerald-300 hover:to-emerald-500 hover:translate-y-[2px] hover:shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15),0_2px_0_0_#065f46] active:translate-y-[4px] transition-all">
                                Combo D
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* ========== OTHER UI ELEMENTS ========== */}
            <div className="border-t-4 border-dashed border-violet-300 pt-12 mt-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
                        <span className="text-3xl">🎯</span>
                        Other UI Elements
                        <span className="text-3xl">🎯</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Applying the playful style to the full design system
                    </p>
                </div>

                {/* Text Inputs */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Text Inputs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-[3px] border-slate-300 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)] focus:border-blue-500 focus:outline-none transition-colors font-medium placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-white border-[3px] border-slate-300 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)] focus:border-blue-500 focus:outline-none transition-colors font-medium placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search quizzes..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border-[3px] border-slate-300 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)] focus:border-violet-500 focus:outline-none transition-colors font-medium placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Error State */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">Email (Error)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                                <input
                                    type="email"
                                    value="invalid-email"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-red-50 border-[3px] border-red-400 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)] focus:border-red-500 focus:outline-none transition-colors font-medium text-red-700"
                                    readOnly
                                />
                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                            </div>
                            <p className="text-sm text-red-600 font-medium">Please enter a valid email</p>
                        </div>
                    </div>
                </section>

                {/* Badges & Tags */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Badges & Tags</h3>
                    <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-bold border-2 border-blue-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                            New
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold border-2 border-emerald-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                            Completed
                        </span>
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-sm font-bold border-2 border-amber-600 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]">
                            In Progress
                        </span>
                        <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-sm font-bold border-2 border-rose-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                            10 Points
                        </span>
                        <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-bold border-2 border-violet-300">
                            Science
                        </span>
                        <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-bold border-2 border-cyan-300">
                            Math
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold border-2 border-orange-500 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                            <Trophy className="w-4 h-4" />
                            Top Score
                        </span>
                    </div>
                </section>

                {/* Cards */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Cards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Quiz Card */}
                        <div className="rounded-2xl bg-white border-[3px] border-slate-200 shadow-[0_4px_0_0_#e2e8f0] overflow-hidden hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#e2e8f0] transition-all cursor-pointer">
                            <div className="h-24 bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center">
                                <Zap className="w-12 h-12 text-white/80" />
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-lg mb-1">Science Quiz</h4>
                                <p className="text-sm text-muted-foreground mb-3">Test your knowledge of physics</p>
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">10 Questions</span>
                                    <span className="text-sm font-bold text-emerald-600">+50 XP</span>
                                </div>
                            </div>
                        </div>

                        {/* Achievement Card */}
                        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-[3px] border-amber-300 shadow-[0_4px_0_0_#fcd34d] p-4 hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#fcd34d] transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-amber-600 flex items-center justify-center shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Quiz Master</h4>
                                    <p className="text-sm text-amber-700">Complete 10 quizzes</p>
                                </div>
                            </div>
                            <div className="w-full h-3 rounded-full bg-amber-200 border border-amber-300 overflow-hidden">
                                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                            </div>
                            <p className="text-right text-sm font-bold text-amber-700 mt-1">7/10</p>
                        </div>

                        {/* Stat Card */}
                        <div className="rounded-2xl bg-white border-[3px] border-emerald-300 shadow-[0_4px_0_0_#86efac] p-4 hover:translate-y-[-2px] hover:shadow-[0_6px_0_0_#86efac] transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-emerald-600">Your Score</span>
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            </div>
                            <p className="text-4xl font-bold text-emerald-700">2,450</p>
                            <p className="text-sm text-muted-foreground">+150 this week</p>
                        </div>
                    </div>
                </section>

                {/* Alerts */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Alerts & Notifications</h3>
                    <div className="space-y-4">
                        {/* Success Alert */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border-[3px] border-emerald-400">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center flex-shrink-0 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-emerald-800">Quiz Completed!</h4>
                                <p className="text-sm text-emerald-700">You scored 8/10. Great job!</p>
                            </div>
                            <button className="text-emerald-600 hover:text-emerald-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Warning Alert */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-[3px] border-amber-400">
                            <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-amber-600 flex items-center justify-center flex-shrink-0 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.1)]">
                                <AlertCircle className="w-5 h-5 text-amber-900" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-amber-800">Time Running Low</h4>
                                <p className="text-sm text-amber-700">Only 2 minutes remaining!</p>
                            </div>
                        </div>

                        {/* Info Alert */}
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border-[3px] border-blue-400">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 border-2 border-blue-700 flex items-center justify-center flex-shrink-0 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                                <Info className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-blue-800">Pro Tip</h4>
                                <p className="text-sm text-blue-700">You can review your answers before submitting.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Toggle & Checkbox */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Toggles & Checkboxes</h3>
                    <div className="flex flex-wrap gap-8 items-center">
                        {/* Toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsToggled(!isToggled)}
                                className={`relative w-14 h-8 rounded-full border-[3px] transition-colors ${
                                    isToggled
                                        ? "bg-emerald-500 border-emerald-700"
                                        : "bg-slate-300 border-slate-400"
                                }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white border-2 shadow-sm transition-all ${
                                        isToggled
                                            ? "left-[calc(100%-24px)] border-emerald-600"
                                            : "left-0.5 border-slate-400"
                                    }`}
                                />
                            </button>
                            <span className="font-medium">Sound Effects</span>
                        </div>

                        {/* Checkbox - Checked */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="w-6 h-6 rounded-lg bg-blue-500 border-[3px] border-blue-700 flex items-center justify-center shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="font-medium">Show hints</span>
                        </label>

                        {/* Checkbox - Unchecked */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="w-6 h-6 rounded-lg bg-white border-[3px] border-slate-300 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)]" />
                            <span className="font-medium">Auto-submit</span>
                        </label>

                        {/* Radio - Selected */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="w-6 h-6 rounded-full bg-white border-[3px] border-violet-500 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-violet-500" />
                            </div>
                            <span className="font-medium">Easy Mode</span>
                        </label>

                        {/* Radio - Unselected */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="w-6 h-6 rounded-full bg-white border-[3px] border-slate-300" />
                            <span className="font-medium">Hard Mode</span>
                        </label>
                    </div>
                </section>

                {/* Tabs */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Tabs</h3>
                    <div className="p-1 rounded-2xl bg-slate-100 border-[3px] border-slate-200 inline-flex gap-1">
                        {["All Quizzes", "My Quizzes", "Favorites"].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(i)}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                                    selectedTab === i
                                        ? "bg-blue-500 text-white border-2 border-blue-700 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]"
                                        : "text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Progress Bars */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Progress Bars</h3>
                    <div className="space-y-4 max-w-md">
                        {/* Quiz Progress */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold">Question 7 of 10</span>
                                <span className="text-sm font-bold text-blue-600">70%</span>
                            </div>
                            <div className="h-4 rounded-full bg-slate-200 border-2 border-slate-300 overflow-hidden">
                                <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]" />
                            </div>
                        </div>

                        {/* XP Progress */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold">Level 5</span>
                                <span className="text-sm font-bold text-violet-600">450/500 XP</span>
                            </div>
                            <div className="h-4 rounded-full bg-violet-100 border-2 border-violet-200 overflow-hidden">
                                <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]" />
                            </div>
                        </div>

                        {/* Score Bar */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold">Your Score</span>
                                <span className="text-sm font-bold text-emerald-600">85%</span>
                            </div>
                            <div className="h-4 rounded-full bg-emerald-100 border-2 border-emerald-200 overflow-hidden">
                                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dropdown / Select */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Dropdown / Select</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <select className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white border-[3px] border-slate-300 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)] focus:border-blue-500 focus:outline-none font-medium cursor-pointer">
                                <option>Select Category</option>
                                <option>Science</option>
                                <option>Math</option>
                                <option>History</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select className="appearance-none px-4 py-2.5 pr-10 rounded-full bg-white border-[3px] border-violet-300 shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.05)] focus:border-violet-500 focus:outline-none font-medium cursor-pointer text-violet-700">
                                <option>Difficulty: All</option>
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400 pointer-events-none" />
                        </div>
                    </div>
                </section>

                {/* Avatar & User Elements */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Avatars & User Elements</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Basic Avatars */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 border-[3px] border-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                            JD
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-[3px] border-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                            AB
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center text-white shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                            <User className="w-5 h-5" />
                        </div>

                        {/* User Pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border-2 border-slate-200">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border border-orange-600 flex items-center justify-center text-white text-xs font-bold">
                                K
                            </div>
                            <span className="font-medium text-sm">@karen_quiz</span>
                        </div>

                        {/* Notification Badge */}
                        <button className="relative p-2 rounded-xl bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 transition-colors">
                            <Bell className="w-6 h-6 text-slate-600" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-2 border-white text-white text-xs font-bold flex items-center justify-center">
                                3
                            </span>
                        </button>
                    </div>
                </section>

                {/* Tooltip Preview */}
                <section className="mb-12">
                    <h3 className="text-lg font-semibold mb-3 text-violet-600">Tooltips</h3>
                    <div className="flex gap-8 items-center">
                        <div className="relative inline-block">
                            <button className="px-4 py-2 rounded-xl bg-slate-200 border-2 border-slate-300 font-medium">
                                Hover me
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-sm font-medium whitespace-nowrap">
                                This is a tooltip!
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                            </div>
                        </div>

                        <div className="relative inline-block">
                            <button className="px-4 py-2 rounded-xl bg-blue-500 text-white border-2 border-blue-700 font-bold shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                                Submit
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-sm font-bold border-2 border-emerald-700 whitespace-nowrap shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.15)]">
                                Click to submit your answers!
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emerald-500" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Feedback prompt */}
            <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200 dark:from-violet-950/30 dark:to-pink-950/30 dark:border-violet-800">
                <p className="text-center text-muted-foreground">
                    How do these UI elements feel with the playful style? Let me know what to adjust!
                </p>
            </div>
        </div>
    );
}
