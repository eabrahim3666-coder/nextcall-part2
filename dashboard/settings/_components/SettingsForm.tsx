"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BusinessData = {
    business_name: string;
    business_type: string;
    service_area: string;
    owner_phone: string;
    knowledge_base_text: string;
};

export default function SettingsForm({ initialData }: { initialData: BusinessData }) {
    const [data, setData] = useState<BusinessData>(initialData);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch('/api/business/update-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) setSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <Input value={data.business_name} onChange={(e) => setData({ ...data, business_name: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <Input value={data.business_type} onChange={(e) => setData({ ...data, business_type: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                    <Input value={data.service_area} onChange={(e) => setData({ ...data, service_area: e.target.value })} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone (For Emergencies)</label>
                <Input type="tel" value={data.owner_phone} onChange={(e) => setData({ ...data, owner_phone: e.target.value })} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Knowledge Base & Instructions</label>
                <textarea
                    rows={6}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.knowledge_base_text}
                    onChange={(e) => setData({ ...data, knowledge_base_text: e.target.value })}
                    placeholder="Tell your AI exactly what it needs to know. Examples:&#10;- We are open Mon-Fri 8am to 5pm, closed weekends.&#10;- Our call-out fee is $75.&#10;- We do NOT fix hot tubs or pools.&#10;- If someone asks about pricing for a boiler, transfer them to the owner."
                />
                <p className="text-xs text-gray-500 mt-1">The AI will read this before every call. Be as specific as you want!</p>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save AI Settings"}
            </Button>

            {success && <p className="text-sm text-green-600 font-medium mt-2">✅ Settings updated! AI will use these on the next call.</p>}
        </form>
    );
}