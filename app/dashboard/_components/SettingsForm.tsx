"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Make sure to add this via npx shadcn-ui@latest add input if you haven't

type BusinessData = {
    business_name: string;
    business_type: string;
    service_area: string;
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

            if (res.ok) {
                setSuccess(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <Input
                    value={data.business_name}
                    onChange={(e) => setData({ ...data, business_name: e.target.value })}
                    placeholder="e.g. London Fast Plumbing"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type / Industry</label>
                <Input
                    value={data.business_type}
                    onChange={(e) => setData({ ...data, business_type: e.target.value })}
                    placeholder="e.g. Plumber, Dentist, Real Estate"
                />
                <p className="text-xs text-gray-500 mt-1">This changes how the AI detects emergencies.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                <Input
                    value={data.service_area}
                    onChange={(e) => setData({ ...data, service_area: e.target.value })}
                    placeholder="e.g. London and 15-mile radius"
                />
                <p className="text-xs text-gray-500 mt-1">The AI will reject leads outside this area.</p>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save AI Settings"}
            </Button>

            {success && <p className="text-sm text-green-600 font-medium mt-2">✅ Settings updated! AI will use these on the next call.</p>}
        </form>
    );
}