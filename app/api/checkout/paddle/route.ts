import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure the priceId and quantity sent from your frontend
    const { priceId, quantity = 1 } = body; 

    // Call Paddle API to generate a transaction/checkout link
    // Automatically use Sandbox API if the sandbox key is present
    const paddleApiBase = process.env.PADDLE_API_KEY?.startsWith('pdl_sdbx_') 
      ? 'https://sandbox-api.paddle.com' 
      : 'https://api.paddle.com';
      
    // Debug logs to monitor your keys in Vercel logs
    console.log("Using API base:", paddleApiBase);
    console.log("Key prefix:", process.env.PADDLE_API_KEY?.substring(0, 10));

    // Send the structured payload that Paddle expects
    const response = await fetch(`${paddleApiBase}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          { price_id: priceId, quantity }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paddle API Error:", data.error);
      return NextResponse.json({ error: data.error || "Failed to create Paddle checkout" }, { status: 400 });
    }

    // Fix: Paddle nests response data inside a "data" object
    return NextResponse.json({ url: data.data?.checkout?.url });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}