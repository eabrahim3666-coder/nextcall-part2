import { NextResponse } from 'next/server';
import { businessesCollection } from '@/lib/astra';
import { auth } from '@clerk/nextjs/server'; // Changed to /server

export async function POST(request: Request) {
  try {
    // Must await auth() in the new version
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { business_name, business_type, service_area, owner_phone, knowledge_base_text } = body;

    await businessesCollection.updateOne(
      { business_id: userId },
      { 
        $set: { 
          business_name,
          business_type,
          service_area,
          owner_phone,
          knowledge_base_text
        } 
      }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Error updating settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}