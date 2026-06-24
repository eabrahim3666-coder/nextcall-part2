import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { businessesCollection } from '@/lib/astra';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const business = await businessesCollection.findOne({ business_id: userId });
    if (!business?.lemon_squeezy_customer_id) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 });
    }

    // Call Lemon Squeezy API to generate a Customer Portal link
    const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${business.lemon_squeezy_customer_id}/portal-links`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        data: {
          type: "portal-links",
          attributes: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
          }
        }
      })
    });

    const data = await response.json();
    
    if (data.data?.attributes?.url) {
      return NextResponse.json({ url: data.data.attributes.url });
    } else {
      console.error("Lemon Squeezy Portal Error:", data);
      throw new Error("Failed to generate portal link");
    }

  } catch (error) {
    console.error("Billing Portal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}