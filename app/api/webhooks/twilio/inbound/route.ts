import { NextResponse } from 'next/server';
import retellClient from '@/lib/retell';
import { businessesCollection } from '@/lib/astra';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callerNumber = formData.get('From') as string;
    const twilioNumber = formData.get('To') as string; 

    const business = await businessesCollection.findOne({ twilio_number: twilioNumber });

    if (!business) {
      console.error("Business not found for number:", twilioNumber);
      const errorTwiml = `<Response><Say>Sorry, this number is not configured.</Say></Response>`;
      return new NextResponse(errorTwiml, { headers: { 'Content-Type': 'text/xml' } });
    }


    // ============ USAGE LIMIT PROTECTION ============
    const minutesUsed = Number(business?.total_minutes_used || 0);
    const minutesLimit = Number(business?.minutes_limit || 200);

    if (minutesUsed >= minutesLimit) {
      console.warn(`🛑 Call rejected for ${business.business_name}: Minute limit reached (${minutesUsed}/${minutesLimit})`);
      
      // 1. Notify the business owner they missed a lead due to limits
      if (business.business_id) {
        try {
          const { notificationsCollection } = await import('@/lib/astra');
          await notificationsCollection.insertOne({
            business_id: business.business_id,
            type: "minutes_100",
            title: "Call Missed - Limit Reached",
            message: `You missed a call from ${callerNumber} because you hit your monthly minute limit. Upgrade your plan to capture every lead!`,
            read: false,
            created_at: new Date().toISOString(),
          });
        } catch (e) { console.error("Failed to send limit notification:", e); }
      }

      // 2. Play a professional message to the caller and hang up
      const limitTwiml = `<Response><Say voice="alice">The party you are calling is currently unavailable. Please try again later.</Say><Hangup /></Response>`;
      return new NextResponse(limitTwiml, { headers: { 'Content-Type': 'text/xml' } });
    }


    // 2. Register the call with Retell, injecting dynamic metadata!
    const callResponse = await retellClient.call.createPhoneCall({
      agent_id: process.env.RETELL_AGENT_ID!, 
      metadata: {
        business_name: business.business_name,
        business_type: business.business_type,
        service_area: business.service_area,
        owner_phone: business.owner_phone, // CRITICAL: The AI needs this to pass to the transfer function
        business_id: business.business_id,
        customer_phone: callerNumber,
        knowledge_base: business.knowledge_base_text || "",
        greeting: business.greeting_text || "",
        greeting_tone: business.greeting_tone || "friendly",
        routing_rules: JSON.stringify(business.routing_rules || {}),
        call_source: twilioNumber,
        
        // NEW: Added so the AI knows what a dynamic emergency means for this company
        emergency_definition: business.emergency_definition || "a life-threatening situation or severe property damage"
      },
    });

    console.log(`Retell Call created: ${callResponse.call_id} for ${business.business_name}`);

    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Application>${process.env.TWILIO_VOICE_APP_SID}</Application>
        </Connect>
      </Response>`;

    return new NextResponse(twimlResponse, {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error: any) {
    // Log the exact error Retell or Twilio is throwing
    console.error("EXACT INBOUND ERROR:", error?.response?.data || error?.message || error);
    const errorTwiml = `<Response><Say>An error occurred. Please try again.</Say></Response>`;
    return new NextResponse(errorTwiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}