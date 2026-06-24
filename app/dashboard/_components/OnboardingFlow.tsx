"use client";

import { useState, useEffect } from "react";

const BUSINESS_TYPES = [
    "Plumbing", "Electrical", "HVAC", "Roofing", "Landscaping",
    "Cleaning", "Painting", "General Contractor", "Auto Repair",
    "Legal Services", "Real Estate", "Healthcare", "Salon & Spa",
    "Restaurant", "Retail", "Other"
];

const INDUSTRIES = [
    "Home Services", "Healthcare", "Legal", "Real Estate",
    "Food & Beverage", "Beauty & Wellness", "Automotive",
    "Technology", "Finance", "Education", "Other"
];

function ResendButton({ onResend, disabled }: { onResend: () => void; disabled: boolean }) {
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    if (disabled) return null;

    return cooldown > 0 ? (
        <p className="text-xs text-neutral-600">Resend available in {cooldown}s</p>
    ) : (
        <button onClick={() => { onResend(); setCooldown(60); }} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Resend code
        </button>
    );
}

export default function OnboardingFlow() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [banned, setBanned] = useState(false);

    const [form, setForm] = useState({
        business_name: "",
        owner_name: "",
        phone: "",
        business_type: "",
        business_type_custom: "",
        industry: "",
        industry_custom: "",
        hours: "",
        services: "",
        notes: "",
    });

    const [otp, setOtp] = useState("");
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [devOtp, setDevOtp] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined" && !(window as any).Paddle) {
            const script = document.createElement("script");
            script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
            script.async = true;
            script.onload = () => {
                const Paddle = (window as any).Paddle;
                if (Paddle) {
                    Paddle.Environment.set("sandbox");
                    Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
                }
            };
            document.body.appendChild(script);
        }
    }, []);

    const handlePaddleCheckout = () => {
        const Paddle = (window as any).Paddle;
        if (Paddle) {
            Paddle.Checkout.open({
                items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || "pri_12345", quantity: 1 }],
                settings: {
                    successUrl: `${window.location.origin}/dashboard?paddle=success`
                }
            });
        } else {
            setError("Payment system is still loading. Please wait a moment and try again.");
        }
    };

    const updateForm = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError("");
    };

    const getBusinessType = () => form.business_type === "Other" ? form.business_type_custom : form.business_type;
    const getIndustry = () => form.industry === "Other" ? form.industry_custom : form.industry;

    const sendOtp = async () => {
        if (banned) return;
        if (!form.phone || form.phone.length < 10) {
            setError("Enter a valid phone number");
            return;
        }
        setLoading(true);
        setError("");
        setWarning("");
        try {
            const res = await fetch("/api/business/verify-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: form.phone, action: "send" }),
            });
            const data = await res.json();
            if (data.banned) { setBanned(true); setError(data.error); return; }
            if (!res.ok) { setError(data.error || "Failed to send code"); return; }
            if (data.dev_otp) setDevOtp(data.dev_otp);
            if (data.warning) setWarning(data.warning);
            setStep(2);
        } catch { setError("Network error"); } finally { setLoading(false); }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length < 4) { setError("Enter the verification code"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/business/verify-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: form.phone, code: otp, action: "verify" }),
            });
            const data = await res.json();
            if (data.verified) { setPhoneVerified(true); setStep(3); }
            else { setError(data.error || "Invalid code"); }
        } catch { setError("Network error"); } finally { setLoading(false); }
    };

    const submitOnboarding = async () => {
        setLoading(true);
        try {
            const payload = { ...form, business_type: getBusinessType(), industry: getIndustry() };
            const res = await fetch("/api/business/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                // FIX: Bust cache and force routing to /dashboard to see the Paywall
                window.location.href = '/dashboard?cachebust=' + Date.now();
                return;
            }
            else setError(data.error || "Failed to save");

        } catch { setError("Network error"); } finally { setLoading(false); }
    };

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-lg">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-500">Step {step} of {totalSteps}</span>
                        <span className="text-xs text-indigo-400 font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
                        <h2 className="text-2xl font-semibold text-white tracking-tight">Tell us about <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">your business</span></h2>
                        <p className="text-sm text-neutral-400 mt-2 mb-6">We'll use this to personalize your AI</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Business Name</label>
                                <input type="text" value={form.business_name} onChange={(e) => updateForm("business_name", e.target.value)} placeholder="e.g. Mike's Plumbing" className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Owner / Manager Name</label>
                                <input type="text" value={form.owner_name} onChange={(e) => updateForm("owner_name", e.target.value)} placeholder="e.g. Mike Johnson" className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Cell Phone Number</label>
                                <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+1 (555) 123-4567" className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                            </div>
                        </div>

                        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

                        <button onClick={() => setStep(2)} disabled={!form.business_name || !form.owner_name || !form.phone} className="mt-6 w-full bg-white text-black text-sm font-medium px-6 py-3.5 rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            Continue →
                        </button>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
                        <h2 className="text-2xl font-semibold text-white tracking-tight">What do <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">you do?</span></h2>
                        <p className="text-sm text-neutral-400 mt-2 mb-6">Help us train your AI for your industry</p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Business Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {BUSINESS_TYPES.map((type) => (
                                        <button key={type} onClick={() => updateForm("business_type", type)} className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${form.business_type === type ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300" : "bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:border-white/20 hover:text-white"}`}>
                                            {type === "Other" ? "Other..." : type}
                                        </button>
                                    ))}
                                </div>
                                {form.business_type === "Other" && (
                                    <input type="text" value={form.business_type_custom} onChange={(e) => updateForm("business_type_custom", e.target.value)} placeholder="Type your business type..." autoFocus className="mt-2 w-full bg-white/[0.05] border border-indigo-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Industry</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {INDUSTRIES.map((ind) => (
                                        <button key={ind} onClick={() => updateForm("industry", ind)} className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${form.industry === ind ? "bg-purple-500/20 border border-purple-500/40 text-purple-300" : "bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:border-white/20 hover:text-white"}`}>
                                            {ind === "Other" ? "Other..." : ind}
                                        </button>
                                    ))}
                                </div>
                                {form.industry === "Other" && (
                                    <input type="text" value={form.industry_custom} onChange={(e) => updateForm("industry_custom", e.target.value)} placeholder="Type your industry..." autoFocus className="mt-2 w-full bg-white/[0.05] border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all" />
                                )}
                            </div>
                        </div>

                        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

                        <button onClick={() => { const bt = getBusinessType(); const ind = getIndustry(); if (bt && ind) setStep(3); else setError(form.business_type === "Other" && !form.business_type_custom ? "Please type your business type" : form.industry === "Other" && !form.industry_custom ? "Please type your industry" : "Select both business type and industry"); }} disabled={!getBusinessType() || !getIndustry()} className="mt-6 w-full bg-white text-black text-sm font-medium px-6 py-3.5 rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            Continue →
                        </button>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
                        <h2 className="text-2xl font-semibold text-white tracking-tight">Almost <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">there!</span></h2>
                        <p className="text-sm text-neutral-400 mt-2 mb-6">Last details to make your AI perfect</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Business Hours</label>
                                <input type="text" value={form.hours} onChange={(e) => updateForm("hours", e.target.value)} placeholder="e.g. Mon-Fri 8am-6pm, Sat 9am-2pm" className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Services You Offer</label>
                                <textarea value={form.services} onChange={(e) => updateForm("services", e.target.value)} placeholder="e.g. Leak repair, pipe installation, water heater service..." rows={3} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">Special Notes for AI</label>
                                <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="e.g. Free estimates, emergency service 24/7, senior discounts..." rows={3} className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none" />
                            </div>
                        </div>

                        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

                        <button onClick={submitOnboarding} disabled={!form.hours || !form.services || loading} className="mt-6 w-full bg-white text-black text-sm font-medium px-6 py-3.5 rounded-full hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            {loading ? "Setting up your AI..." : "Launch My AI →"}
                        </button>
                    </div>
                )}

                {/* STEP 5: Success + Activation */}
                {step === 5 && (
                    <div className="space-y-6">
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl text-center">
                            <h2 className="text-3xl font-semibold text-white tracking-tight mb-3">Your AI is <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">configured!</span></h2>
                            <p className="text-sm text-neutral-400 mb-2">We've set up {form.business_name}'s AI receptionist with everything you told us.</p>
                            <p className="text-xs text-neutral-500">One more step to bring it to life.</p>
                        </div>

                        <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />
                            <div className="relative z-10">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-semibold text-white tr
                                    acking-tight">Activate <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Your AI</span></h2>
                                    <p className="text-sm text-neutral-400 mt-2">Go live and start capturing every lead</p>                                </div>
                                <div className="space-y-3 mb-6">
                                    {[
                                        "AI answers calls 24/7 — never miss a lead",
                                        "Smart follow-ups via SMS & email",
                                        "Auto appointment scheduling",
                                        "Real-time call analytics & sentiment",
                                        "500 minutes included every month",
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                            <span className="text-emerald-400 text-xs mt-0.5">+</span>
                                            <span className="text-sm text-neutral-300">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 mb-6">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase tracking-wider">Monthly</p>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-semibold text-white">$200</span>
                                                <span className="text-sm text-neutral-500">/month</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-500">500 min included</p>
                                            <p className="text-[10px] text-neutral-600">$0.40/min after</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handlePaddleCheckout} className="w-full bg-white text-black text-sm font-medium px-6 py-3.5 rounded-full hover:bg-neutral-200 transition-colors">
                                    Activate Now →
                                </button>
                                <p className="text-[10px] text-neutral-600 text-center mt-3">Cancel anytime. No contracts. 7-day free trial included.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

