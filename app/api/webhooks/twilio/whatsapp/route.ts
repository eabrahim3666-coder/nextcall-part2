import { NextResponse } from 'next/server';
import twilioClient from '@/lib/twilio';
import { callsCollection, conversationsCollection, businessesCollection } from '@/lib/astra';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fromNumber = formData.get('From') as string; // e.g., whatsapp:+1234567890
    const toNumber = formData.get('To') as string;     // Your Twilio WhatsApp Number
    const messageBody = formData.get('Body') as string;

    // 1. Find the business associated with this Twilio Number
    const business = await businessesCollection.findOne({ twilio_number: toNumber.replace('whatsapp:', '') });

    if (!business) {
      console.error("Business not found for number:", toNumber);
      return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
    }

    // 2. Check if the sender is the BUSINESS OWNER
    const isOwner = fromNumber.includes(business.owner_phone);

    if (isOwner) {
      // --- OWNER REPLY LOGIC (Review Loop) ---
      const pendingCall = await callsCollection.findOne({ 
        business_id: business.business_id, 
        review_status: "awaiting_owner_reply" 
      });

      if (pendingCall) {
        if (messageBody.trim() === "1") {
          // Owner said YES, send review link to customer
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reviews/send-to-customer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ call_id: pendingCall.call_id })
          });
          
          // Update DB
          await callsCollection.updateOne(
            { call_id: pendingCall.call_id },
            { $set: { review_status: "link_sent" } }
          );

        } else if (messageBody.trim() === "2") {
          // Owner said NO
          await callsCollection.updateOne(
            { call_id: pendingCall.call_id },
            { $set: { review_status: "rejected_by_owner" } }
          );
        }
      }
    } else {
      // --- CUSTOMER MESSAGE LOGIC (Smart Memory) ---
      // Save the customer's WhatsApp message to AstraDB for context recall later
      await conversationsCollection.insertOne({
        business_id: business.business_id,
        customer_phone: fromNumber.replace('whatsapp:', ''),
        channel: "WhatsApp",
        message: messageBody,
        direction: "inbound",
        created_at: new Date().toISOString()
      });

      // Optional: Auto-reply to the customer on WhatsApp
      // (Keeping it simple for now, just saving the memory)
    }

    // Return empty TwiML so Twilio doesn't throw an error
    return new NextResponse('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error("❌ Error handling WhatsApp webhook:", error);
    return new NextResponse('<Response></Response>', { headers: { 'Content-Type': 'text/xml' } });
  }
}