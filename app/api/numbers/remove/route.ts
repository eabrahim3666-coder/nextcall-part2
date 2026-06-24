import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import twilioClient from '@/lib/twilio';
import { businessesCollection } from '@/lib/astra';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { phoneNumber } = await request.json();

    // 1. Find the Twilio number SID to release it
    const numbers = await twilioClient.incomingPhoneNumbers.list({ phoneNumber: phoneNumber, limit: 1 });
    if (numbers.length > 0) {
      await twilioClient.incomingPhoneNumbers(numbers[0].sid).remove();
    }

    // AstraDB doesn't support $pull. We must fetch, filter, and $set.
    const business = await businessesCollection.findOne({ business_id: userId });
    const currentNumbers = business?.twilio_numbers || [];
    const updatedNumbers = currentNumbers.filter((num: string) => num !== phoneNumber);

    await businessesCollection.updateOne(
      { business_id: userId },
      { $set: { twilio_numbers: updatedNumbers } }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(" Error removing number:", error);
    return NextResponse.json({ error: "Failed to remove number" }, { status: 500 });
  }
}