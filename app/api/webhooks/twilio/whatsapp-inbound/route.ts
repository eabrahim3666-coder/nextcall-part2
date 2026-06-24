import { NextResponse } from 'next/server';
import twilioClient from '@/lib/twilio';
import { callsCollection } from '@/lib/astra';

export async function POST(request: Request) {
  try {
    // Twilio sends webhooks as application/x-www-form-urlencoded
    const formData = await request.formData();
    const from = formData.get('From') as string; // e.g., 'whatsapp:+1234567890'
    const body = (formData.get('Body') as string).trim(); // '1' or '2'

    // Extract raw phone number (remove 'whatsapp:' prefix)
    const ownerPhone = from.replace('whatsapp:', '');

    // 1. Find the most recent call for this owner that is awaiting a reply
    const pendingCall = await callsCollection.findOne(
      { business_id: ownerPhone, review_status: "awaiting_owner_reply" },
      { sort: { created_at: -1 } } // Get the latest one just in case
    );

    if (!pendingCall) {
      // No pending review found, just ignore or send them a help message
      return new NextResponse('<Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // 2. Filter the owner's response
    if (body === '1') {
      // YES - Send the review link to the customer via SMS
      
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: pendingCall.customer_phone,
        body: `Hi! Thanks for choosing ${pendingCall.business_name || 'us'}. If you loved our service, would you mind leaving us a quick review? It helps us a lot! ⭐\n\n${process.env.NEXT_PUBLIC_GOOGLE_REVIEW_LINK || 'https://google.com'}`
      });

      // Update DB status
      await callsCollection.updateOne(
        { call_id: pendingCall.call_id },
        { $set: { review_status: "link_sent" } }
      );

    } else if (body === '2') {
      // NO - Shield the business from a bad review
      await callsCollection.updateOne(
        { call_id: pendingCall.call_id },
        { $set: { review_status: "declined_by_owner" } }
      );

      // --- BOSS ALERTS (No n8n needed) ---

      // 1. Direct Telegram Alert
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const teleMsg = `🛡️ <b>Review Shield Activated</b>\n\nOwner at <b>${pendingCall.business_name || 'Unknown Business'}</b> declined sending a review link to customer ${pendingCall.customer_phone}.\n\n<i>This might indicate a bad customer experience.</i>`;
        
        fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: teleMsg,
            parse_mode: 'HTML'
          })
        }).catch(err => console.error("Telegram fetch failed:", err)); // Fire and forget, don't block Twilio webhook
      }

      // 2. Log to AstraDB Notifications (Shows up in your Admin Command Center)
      try {
        const { notificationsCollection } = await import('@/lib/astra'); // Adjust import path if needed
        await notificationsCollection.insertOne({
          type: "review_declined",
          message: `Owner at ${pendingCall.business_name} declined review for ${pendingCall.customer_phone}`,
          business_id: pendingCall.business_id,
          call_id: pendingCall.call_id,
          created_at: new Date().toISOString(),
          is_read: false
        });
      } catch (notifError) {
        console.error("Failed to log notification to AstraDB:", notifError);
      }
    }

    // Return empty TwiML so Twilio doesn't throw an error
    return new NextResponse('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error("❌ Error processing WhatsApp inbound:", error);
    return new NextResponse('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}