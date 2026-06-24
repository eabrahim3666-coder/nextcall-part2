import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Call Paddle API to generate a transaction/checkout link
    const response = await fetch('https://api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ price_id: body.priceId, quantity: 1 }],
        custom_data: {
          clerk_user_id: body.clerk_user_id,
          business_name: body.business_name,
          plan: body.plan
        },
        checkout: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?paddle=success`
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paddle API Error:", data.error);
      return NextResponse.json({ error: data.error || "Failed to create Paddle checkout" }, { status: 400 });
    }

    // Return the hosted checkout URL to the frontend
    return NextResponse.json({ url: data.checkout.url });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}