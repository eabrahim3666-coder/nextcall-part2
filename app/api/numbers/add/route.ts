import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import twilioClient from '@/lib/twilio';
import { businessesCollection } from '@/lib/astra';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const business = await businessesCollection.findOne({ business_id: userId });
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    // 1. Find an available number
    const availableNumbers = await twilioClient.availablePhoneNumbers('US').local.list({ limit: 1 });
    if (availableNumbers.length === 0) return NextResponse.json({ error: "No numbers available" }, { status: 400 });

    // 2. Buy it and link to our Webhook automatically!
    const purchasedNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: availableNumbers[0].phoneNumber,
      friendlyName: `${business.business_name} - nextCall`,
      voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/inbound`, // Magic link!
      voiceMethod: 'POST'
    });

    // 3. Push to the array in AstraDB
    await businessesCollection.updateOne(
      { business_id: userId },
      { $push: { twilio_numbers: purchasedNumber.phoneNumber } }
    );

    return NextResponse.json({ phoneNumber: purchasedNumber.phoneNumber });

  } catch (error) {
    console.error("❌ Error buying number:", error);
    return NextResponse.json({ error: "Failed to buy number" }, { status: 500 });
  }
}