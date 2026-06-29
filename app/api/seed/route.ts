import { NextResponse } from 'next/server';
import { businessesCollection } from '@/lib/astra';

export async function GET() {
  try {
    const clerkId = "user_3DaQW5FrBlSttJjEgBgnlnBYtiT"; // Your actual Clerk ID

    // The exact data you provided
    const demoBusiness = {
      business_id: clerkId,
      business_name: "NextCall Demo Corp",
      owner_name: "Ebrahim",
      owner_phone: "15551234567", // Kept as string to prevent JS precision loss
      business_type: "AI SaaS Platform",
      service_area: "United States (Remote)",
      email: "eabrahim3666@gmail.com",
      status: "active",
      plan: "premium",
      minutes_limit: 500,
      overage_rate: 0.4,
      total_minutes_used: 42,
      total_calls_processed: 8,
      twilio_number: "18382652892",
      twilio_subaccount_sid: "ACfake_subaccount_sid_for_demo",
      paddle_subscription_id: "sub_demo_premium_001",
      paddle_customer_id: "cust_demo_001",
      created_at: "2024-06-01T09:00:00Z",
      updated_at: "2024-06-20T14:22:00Z",
      knowledge_base_text: "Business Name: NextCall Demo Corp\nBusiness Type: AI Receptionist SaaS Provider\nTone: Professional yet friendly\nAI NAME: Sarah\nGREETING: Thank you for calling NextCall Demo Corp, this is Sarah. How can I help you today?\nBUSINESS HOURS:\nMonday to Friday, 9:00 AM to 6:00 PM EST. Saturday 10:00 AM to 2:00 PM EST. Closed Sunday.\nAfter-Hours Protocol: If it is outside business hours, politely inform the caller, collect their name and number, and assure them our team will reach out first thing the next business day.\nSERVICES WE OFFER:\n- AI Voice Receptionist: Answers calls 24/7, books appointments, captures leads.\n- Google Calendar Sync: Automatically puts booked appointments on your calendar.\n- Social Media Auto-Reply: AI responds to your Facebook and Instagram DMs instantly.\nPRICING RULES:\n- Standard Plan: $299/mo (200 minutes)\n- Premium Plan: $399/mo (500 minutes + Social Auto-Reply + Priority Support)\n- Custom Enterprise pricing is available for businesses needing over 1000 minutes.\nWE DO NOT:\n- Provide physical receptionist services\n- Offer outbound cold-calling AI\n- Share customer data with third parties\nSPECIAL INSTRUCTIONS:\n- Always offer the 3-day free trial if the caller is hesitant about pricing.\n- If someone asks for technical support, collect their email and issue, and promise a ticket will be created.",
      hours: "Mon-Fri 9am-6pm EST, Sat 10am-2pm EST, Closed Sunday",
      services: "AI Voice Receptionist, Google Calendar Sync, Social Media Auto-Reply, Zapier Integrations",
      exclusions: "Physical receptionist services, outbound cold-calling AI",
      pricing_rules: "Standard: $299/mo, Premium: $399/mo, Enterprise: Custom",
      notes: "Always offer the 3-day free trial. Create support tickets for technical issues.",
      greeting_tone: "professional",
      greeting_text: "Thank you for calling NextCall Demo Corp, this is Sarah. How can I help you today?",
      ai_name: "Sarah",
      emergency_definition: "Website down for a paying user, or data breach report",
      routing_rules: {
        forward_emergency: true,
        notify_hot_lead: true,
        sms_missed_call: true,
        email_followup: true,
        daily_summary: true,
        appointment_reminders: true
      },
      referral_code: "NEXT-4X9K",
      referred_by: "",
      bonus_minutes: 50,
      google_refresh_token: "",
      meta_page_id: "1214467161741830", // Kept as string
      meta_page_access_token: "EAAOMZCv5KfgwBRmfNkB5gAZBZAVxW27gzU4ZCwUEmVj4LY5OD3iScJNjZBZCrTycQjiXCiBTBdh3ZAsiFZCwUjq4EVSfzzB9N9yjCd2Y9C7iZBoCsvOQbKJGLm3z1UP7N5USxNaSRflTkT3kBZCUBowJsd1RZAYx4UqFOnV9eq2YP3G9EZCRBZA2w4ofvYMRfWMNJniND6eslJ1KgqAZDZD",
      meta_ig_business_id: "1593712812120178" // Kept as string
    };

    // Use upsert so if you run it twice, it updates instead of creating duplicates
    await businessesCollection.updateOne(
      { business_id: clerkId },
      { $set: demoBusiness },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Seed data inserted! You can now log in." });

  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}