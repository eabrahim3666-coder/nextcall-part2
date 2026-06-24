import { NextResponse } from 'next/server';
import twilioClient from '@/lib/twilio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received transfer_call function request:", JSON.stringify(body, null, 2));
    
    // 1. Get the target number dynamically from the AI's function arguments
    // (The AI passes {{metadata.owner_phone}} into this argument)
    const ownerPhone = body.args?.target_number; 
    const emergencyType = body.args?.emergency_type || 'an urgent issue';
    const customerName = body.args?.customer_name || 'A caller';
    
    // Use the business's Twilio number (from metadata) as the caller ID for the SMS
    const fromNumber = body.metadata?.call_source || process.env.TWILIO_PHONE_NUMBER;

    if (!ownerPhone) {
      throw new Error("Missing target_number in function arguments");
    }

    // 2. Send the Urgent SMS via Twilio (Heads up to the owner before the call connects)
    if (fromNumber) {
      try {
        await twilioClient.messages.create({
          body: `EMERGENCY CALL: ${customerName} is on the line regarding ${emergencyType}. Warm transfer in progress!`,
          from: fromNumber,
          to: ownerPhone,
        });
        console.log(`Emergency SMS sent to ${ownerPhone}`);
      } catch (smsError) {
        console.error("Failed to send emergency SMS, but continuing transfer:", smsError);
      }
    }

    // 3. CRITICAL: Return the exact format Retell requires to bridge the call live
    return NextResponse.json({
      forward_phone_number: ownerPhone
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing emergency handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}