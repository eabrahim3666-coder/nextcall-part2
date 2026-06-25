import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Automatically use Sandbox API if the sandbox key is present
    const paddleApiBase = process.env.PADDLE_API_KEY?.startsWith('pdl_sdbx_') 
      ? 'https://sandbox-api.paddle.com' 
      : 'https://api.paddle.com';
      
    // Using Payment Links API to guarantee we get a hosted URL back
    const response = await fetch(`${paddleApiBase}/payment-links`, {
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
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paddle API Error:", data.error);
      return NextResponse.json({ error: data.error || "Failed to create Paddle link" }, { status: 400 });
    }

    // Payment Links API returns the URL directly in data.data.url
    return NextResponse.json({ url: data.data.url });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}