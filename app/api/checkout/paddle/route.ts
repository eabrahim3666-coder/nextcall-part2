import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Automatically use Sandbox API if the sandbox key is present
    const paddleApiBase = process.env.PADDLE_API_KEY?.startsWith('pdl_sdbx_') 
      ? 'https://sandbox-api.paddle.com' 
      : 'https://api.paddle.com';
      
    // Safely construct the URL, removing any trailing slashes to prevent invalid_url
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://nextcall-part2.vercel.app').replace(/\/$/, '');
    const successUrl = `${appUrl}/dashboard?paddle=success`;
      
    const response = await fetch(`${paddleApiBase}/transactions`, {
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
          url: successUrl
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paddle API Error:", data.error);
      return NextResponse.json({ error: data.error || "Failed to create Paddle checkout" }, { status: 400 });
    }

    // Return the hosted checkout URL to the frontend and set the race-condition cookie
    const res = NextResponse.json({ url: data.data.checkout.url });
    res.cookies.set('paddle_redirect', 'true', { path: '/', maxAge: 60 });
    return res;

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}