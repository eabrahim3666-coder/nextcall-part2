import { NextResponse } from 'next/server';
import twilioClient from '@/lib/twilio';
import { callsCollection } from '@/lib/astra';

export async function POST(request: Request) {
  try {
    const { call_id } = await request.json();

    const call = await callsCollection.findOne({ call_id: call_id });
    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Send SMS to the customer with the Google Review link
    // (Using SMS because WhatsApp to customers requires opt-in, SMS is guaranteed)
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: call.customer_phone,
      body: `Hi! Thanks for choosing ${call.business_name}. If you loved our service, would you mind leaving us a quick review? It helps us a lot! ⭐\n\n${process.env.NEXT_PUBLIC_GOOGLE_REVIEW_LINK || 'https://google.com'}`
    });

    // Update AstraDB
    await callsCollection.updateOne(
      { call_id: call_id },
      { $set: { review_status: "link_sent" } }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Error sending review link:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}