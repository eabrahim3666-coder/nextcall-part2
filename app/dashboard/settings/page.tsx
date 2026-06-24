import { auth } from "@clerk/nextjs/server";
import { businessesCollection } from "@/lib/astra";
import { redirect } from "next/navigation";
import SettingsForm from "./_components/SettingsForm";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const business = await businessesCollection.findOne({ business_id: userId });

    const initialData = {
        business_name: business?.business_name || "",
        business_type: business?.business_type || "",
        service_area: business?.service_area || "",
        owner_phone: business?.owner_phone || "",
        // Structured knowledge
        hours: business?.hours || "",
        services: business?.services || "",
        exclusions: business?.exclusions || "",
        pricing_rules: business?.pricing_rules || "",
        notes: business?.notes || "",
        faq: business?.faq || [],
        // Greeting & Tone
        greeting_tone: business?.greeting_tone || "friendly",
        greeting_text: business?.greeting_text || "",
        ai_name: business?.ai_name || "",
        // Routing rules

        emergency_definition: business?.emergency_definition || "",
        routing_rules: business?.routing_rules || {
            forward_emergency: true,
            notify_hot_lead: true,
            sms_missed_call: true,
            email_followup: true,
            daily_summary: true,
            appointment_reminders: true,
        },


        // Keep raw knowledge_base_text as fallback
        knowledge_base_text: business?.knowledge_base_text || "",
        // Referral Data
        referral_code: business?.referral_code || "N/A",
        bonus_minutes: business?.bonus_minutes || 0,


        // Billing Data (NEW)
        plan: business?.plan || "standard",
        minutes_limit: business?.minutes_limit || 200,
        total_minutes_used: business?.total_minutes_used || 0,
        lemon_squeezy_customer_id: business?.lemon_squeezy_customer_id || null,


        // Integrations (Force strings to prevent JS precision loss)
        google_refresh_token: business?.google_refresh_token || null,
        zapier_webhook_url: business?.zapier_webhook_url || null,
        meta_page_access_token: business?.meta_page_access_token ? String(business.meta_page_access_token) : null,
        meta_page_id: business?.meta_page_id ? String(business.meta_page_id) : null,
        meta_ig_business_id: business?.meta_ig_business_id ? String(business.meta_ig_business_id) : null,
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-neutral-400">Configure how your AI answers the phone and qualifies leads.</p>
            </div>
            <SettingsForm initialData={initialData} userId={userId} />
        </div>
    );
}