


"use client";

import React, { useEffect, useState } from "react";
import {
    FileText,
    TrendingUp,
    Users,
    Settings,
    ArrowRight,
    CheckCircle2,
    Moon,
    Sun,
    Menu,
    X,
    BarChart3,
    Shield,
    Zap,
    Sparkles,
    Download,
    Eye,
    Globe2,
} from "lucide-react";

export default function HomePage() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("jemsky-theme");
        if (savedTheme === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        } else if (savedTheme === "light") {
            setIsDark(false);
            document.documentElement.classList.remove("dark");
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setIsDark(prefersDark);
            if (prefersDark) document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("jemsky-theme", newTheme ? "dark" : "light");
        if (newTheme) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    if (!mounted) return null;

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0c0c0e] text-[#f0ede8]" : "bg-[#f8f7f4] text-[#1a1a1a]"
                }`}
        >
            {/* Noise texture overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.025] z-50">
                <svg width="100%" height="100%">
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
                    </filter>
                    <rect width="100%" height="100%" fill="#000" filter="url(#noise)" />
                </svg>
            </div>

            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-400/10 dark:bg-violet-600/8 blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-400/10 dark:bg-amber-500/6 blur-[100px]" />
            </div>

            {/* Navigation */}
            <nav
                className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${isDark
                        ? "border-white/5 bg-[#0c0c0e]/80"
                        : "border-black/5 bg-[#f8f7f4]/80"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent leading-none">
                                    Jemsky
                                </h1>
                                <p className={`text-[10px] font-medium tracking-widest uppercase ${isDark ? "text-white/30" : "text-black/30"}`}>
                                    Invoice
                                </p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {["Features", "Pricing", "Why Us"].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                                    className={`text-sm font-medium transition-colors ${isDark
                                            ? "text-white/50 hover:text-white/90"
                                            : "text-black/50 hover:text-black/90"
                                        }`}
                                >
                                    {item}
                                </a>
                            ))}
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-colors ${isDark
                                        ? "bg-white/5 hover:bg-white/10 text-white/60"
                                        : "bg-black/5 hover:bg-black/10 text-black/50"
                                    }`}
                            >
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            <a
                                href="/invoice"
                                className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-px"
                            >
                                Create Invoice
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className={`pb-4 border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
                            {["Features", "Pricing", "Why Us"].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                                    className={`block py-2.5 text-sm font-medium ${isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
                                        }`}
                                >
                                    {item}
                                </a>
                            ))}
                            <a
                                href="/invoice"
                                className="block mt-3 w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold text-center"
                            >
                                Create Invoice
                            </a>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Left */}
                        <div className="space-y-7">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-violet-500/20 bg-violet-500/8 text-violet-500">
                                <Sparkles className="w-3 h-3" />
                                No signup. No backend. Just invoices.
                            </div>

                            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
                                Invoices that look{" "}
                                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-700 bg-clip-text text-transparent">
                                    seriously good.
                                </span>
                            </h1>

                            <p className={`text-lg leading-relaxed max-w-md ${isDark ? "text-white/50" : "text-black/50"}`}>
                                Create, preview, and download professional PDF invoices in seconds — entirely in your browser. No account needed.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <a
                                    href="/invoice"
                                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all hover:shadow-xl hover:shadow-violet-500/25 hover:-translate-y-0.5"
                                >
                                    Create Your Invoice
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                                <button
                                    className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold border transition-all ${isDark
                                            ? "border-white/10 hover:bg-white/5 text-white/80"
                                            : "border-black/10 hover:bg-black/5 text-black/70"
                                        }`}
                                >
                                    <Eye className="w-4 h-4" />
                                    Live Preview
                                </button>
                            </div>

                            <div className="flex flex-col gap-2.5 pt-4">
                                {[
                                    "Works 100% offline — data stays on your device",
                                    "Download clean, professional PDF invoices",
                                    "Multi-currency · GST/VAT · Custom branding",
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-violet-500" />
                                        <span className={`text-sm ${isDark ? "text-white/60" : "text-black/60"}`}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Invoice Preview Card */}
                        <div className="relative">
                            <div
                                className={`rounded-2xl overflow-hidden border transition-all shadow-2xl ${isDark
                                        ? "border-white/8 bg-white/3 shadow-black/60"
                                        : "border-black/8 bg-white shadow-black/10"
                                    }`}
                            >
                                {/* Mock invoice header */}
                                <div className={`px-7 pt-7 pb-5 border-b ${isDark ? "border-white/8" : "border-black/8"}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 mb-3 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-white" />
                                            </div>
                                            <p className={`text-xs font-semibold tracking-widest uppercase mb-0.5 ${isDark ? "text-white/30" : "text-black/30"}`}>
                                                Jemsky Technologies
                                            </p>
                                            <p className={`text-xs ${isDark ? "text-white/25" : "text-black/25"}`}>jemsky.com · hello@jemsky.com</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-semibold tracking-widest uppercase mb-0.5 ${isDark ? "text-white/30" : "text-black/30"}`}>Invoice</p>
                                            <p className="text-sm font-bold text-violet-500">#INV-2024-042</p>
                                            <p className={`text-xs mt-1 ${isDark ? "text-white/25" : "text-black/25"}`}>Due: 31 Jan 2025</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="px-7 py-5 space-y-3">
                                    {[
                                        { name: "Website Design", qty: 1, amount: "₹45,000" },
                                        { name: "SEO Package — 3 months", qty: 3, amount: "₹18,000" },
                                        { name: "Brand Identity Kit", qty: 1, amount: "₹12,500" },
                                    ].map((item) => (
                                        <div key={item.name} className="flex justify-between items-center">
                                            <div>
                                                <p className={`text-sm font-medium ${isDark ? "text-white/80" : "text-black/80"}`}>{item.name}</p>
                                                <p className={`text-xs ${isDark ? "text-white/30" : "text-black/30"}`}>Qty: {item.qty}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-violet-500">{item.amount}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className={`px-7 py-5 border-t space-y-2 ${isDark ? "border-white/8 bg-white/2" : "border-black/8 bg-black/2"}`}>
                                    <div className="flex justify-between text-sm">
                                        <span className={isDark ? "text-white/40" : "text-black/40"}>Subtotal</span>
                                        <span>₹75,500</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className={isDark ? "text-white/40" : "text-black/40"}>GST 18%</span>
                                        <span>₹13,590</span>
                                    </div>
                                    <div className={`flex justify-between font-bold text-base pt-2 border-t ${isDark ? "border-white/8" : "border-black/8"}`}>
                                        <span>Total</span>
                                        <span className="text-violet-500">₹89,090</span>
                                    </div>
                                </div>

                                {/* Download button mock */}
                                <div className="px-7 pb-7 pt-4">
                                    <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600/15 border border-violet-500/20 text-violet-500 text-sm font-semibold">
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </div>
                                </div>
                            </div>

                            {/* Glow */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-violet-500/20 blur-3xl rounded-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section
                id="features"
                className={`py-24 z-10 relative ${isDark ? "bg-white/2" : "bg-black/2"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Everything you need</h2>
                        <p className={`text-base max-w-xl mx-auto ${isDark ? "text-white/40" : "text-black/40"}`}>
                            A complete invoicing toolkit that runs entirely in your browser — fast, private, and beautiful.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: FileText, title: "Smart Invoice Builder", desc: "Dynamic line items, auto-calculations, and instant previews as you type." },
                            { icon: Download, title: "PDF Download", desc: "Export pixel-perfect A4 PDFs with your branding, logo, and full item breakdown." },
                            { icon: Globe2, title: "Multi-Currency", desc: "Support for INR, USD, EUR, GBP and 30+ currencies with proper formatting." },
                            { icon: BarChart3, title: "Tax & GST Support", desc: "Automated GST/VAT calculations with per-item tax rates and totals." },
                            { icon: Zap, title: "Zero Backend", desc: "All data stays in your browser. No accounts, no servers, no data leaks." },
                            { icon: Users, title: "Client Memory", desc: "Reuse client and company details from your last invoice automatically." },
                            { icon: Shield, title: "Private by Default", desc: "Your invoice data never leaves your device. Complete privacy guaranteed." },
                            { icon: Settings, title: "Custom Branding", desc: "Upload your logo, set brand colors, and make every invoice uniquely yours." },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className={`p-5 rounded-2xl border transition-all group hover:-translate-y-0.5 ${isDark
                                        ? "border-white/6 bg-white/2 hover:bg-white/4"
                                        : "border-black/6 bg-white hover:bg-white"
                                    }`}
                            >
                                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/15 transition-colors">
                                    <feature.icon className="w-4 h-4 text-violet-500" />
                                </div>
                                <h3 className="font-semibold text-sm mb-1.5">{feature.title}</h3>
                                <p className={`text-xs leading-relaxed ${isDark ? "text-white/40" : "text-black/40"}`}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className={`py-24 z-10 relative ${isDark ? "bg-[#0c0c0e]" : "bg-[#f8f7f4]"}`}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Simple pricing</h2>
                        <p className={`text-base ${isDark ? "text-white/40" : "text-black/40"}`}>
                            Start free. Upgrade only when you need more.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            {
                                name: "Free",
                                price: "₹0",
                                desc: "Perfect to get started",
                                features: ["Unlimited invoices", "PDF download", "Local storage", "Multi-currency", "Basic templates"],
                                cta: "Get Started Free",
                                highlight: false,
                            },
                            {
                                name: "Pro",
                                price: "₹299",
                                period: "/mo",
                                desc: "For growing businesses",
                                features: ["Everything in Free", "Premium templates", "Custom branding", "Invoice history", "Priority support"],
                                cta: "Start Pro Trial",
                                highlight: true,
                            },
                            {
                                name: "Team",
                                price: "Custom",
                                desc: "For agencies & teams",
                                features: ["Everything in Pro", "Multiple profiles", "Team workspace", "API access", "Dedicated support"],
                                cta: "Contact Us",
                                highlight: false,
                            },
                        ].map((plan) => (
                            <div
                                key={plan.name}
                                className={`rounded-2xl border p-7 transition-all flex flex-col ${plan.highlight
                                        ? "border-violet-500/40 bg-gradient-to-b from-violet-500/8 to-violet-500/3 ring-1 ring-violet-500/20 scale-[1.02]"
                                        : isDark
                                            ? "border-white/6 bg-white/2"
                                            : "border-black/6 bg-white"
                                    }`}
                            >
                                {plan.highlight && (
                                    <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-500 text-xs font-semibold self-start">
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                                <p className={`text-xs mb-5 ${isDark ? "text-white/35" : "text-black/35"}`}>{plan.desc}</p>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && <span className={`text-sm ${isDark ? "text-white/40" : "text-black/40"}`}>{plan.period}</span>}
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-violet-500" />
                                            <span className={`text-sm ${isDark ? "text-white/60" : "text-black/60"}`}>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.highlight
                                            ? "bg-violet-600 hover:bg-violet-700 text-white hover:shadow-lg hover:shadow-violet-500/25"
                                            : isDark
                                                ? "bg-white/5 hover:bg-white/10 text-white/80"
                                                : "bg-black/5 hover:bg-black/10 text-black/70"
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Jemsky */}
            <section id="why-us" className={`py-24 z-10 relative ${isDark ? "bg-white/2" : "bg-black/2"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-8 tracking-tight leading-tight">
                                Why businesses choose<br />
                                <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                                    Jemsky Invoice
                                </span>
                            </h2>
                            <div className="space-y-5">
                                {[
                                    { title: "Built for jemsky.com", desc: "Designed as a first-class product — not an afterthought." },
                                    { title: "Privacy-first architecture", desc: "Zero data collection. Your invoices stay on your device, always." },
                                    { title: "Works offline instantly", desc: "No internet needed after first load. Create invoices anywhere, anytime." },
                                    { title: "Professional PDFs instantly", desc: "One click to a pixel-perfect invoice your clients will trust." },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-violet-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm mb-0.5">{item.title}</h3>
                                            <p className={`text-sm ${isDark ? "text-white/40" : "text-black/40"}`}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className={`rounded-2xl border p-8 grid grid-cols-2 gap-px overflow-hidden ${isDark ? "border-white/6 bg-white/6" : "border-black/6 bg-black/6"}`}>
                            {[
                                { value: "100%", label: "Browser-based" },
                                { value: "0ms", label: "Server latency" },
                                { value: "∞", label: "Free invoices" },
                                { value: "30+", label: "Currencies" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className={`p-7 text-center ${isDark ? "bg-[#0c0c0e]" : "bg-[#f8f7f4]"}`}
                                >
                                    <p className="text-3xl font-bold text-violet-500 mb-1">{stat.value}</p>
                                    <p className={`text-xs font-medium ${isDark ? "text-white/35" : "text-black/35"}`}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 z-10 relative">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className={`rounded-3xl border p-12 relative overflow-hidden ${isDark ? "border-white/8 bg-white/2" : "border-black/6 bg-white"}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-purple-500/8" />
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-violet-500/20 bg-violet-500/8 text-violet-500 mb-6">
                                <Sparkles className="w-3 h-3" />
                                Free forever for core features
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                                Your next invoice is<br />30 seconds away.
                            </h2>
                            <p className={`text-base mb-8 max-w-sm mx-auto ${isDark ? "text-white/40" : "text-black/40"}`}>
                                No signup. No credit card. Just open and start creating.
                            </p>
                            <a
                                href="/invoice"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
                            >
                                Create Free Invoice
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={`border-t py-10 z-10 relative ${isDark ? "border-white/5" : "border-black/5"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-bold bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent">
                                Jemsky Invoice
                            </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                            {["Privacy", "Terms", "Support"].map((item) => (
                                <a
                                    key={item}
                                    href={`/${item.toLowerCase()}`}
                                    className={`transition-colors ${isDark ? "text-white/35 hover:text-white/70" : "text-black/35 hover:text-black/70"}`}
                                >
                                    {item}
                                </a>
                            ))}
                        </div>

                        <p className={`text-xs ${isDark ? "text-white/25" : "text-black/25"}`}>
                            © {new Date().getFullYear()} Jemsky · jemsky.com
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}