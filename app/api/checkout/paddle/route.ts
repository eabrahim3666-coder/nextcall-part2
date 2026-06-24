import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Call Paddle API to generate a transaction/checkout link
    // Automatically use Sandbox API if the sandbox key is present
    const paddleApiBase = process.env.PADDLE_API_KEY?.startsWith('pdl_sdbx_') 
      ? 'https://sandbox-api.paddle.com' 
      : 'https://api.paddle.com';
      
    const response = await fetch(`${paddleApiBase}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      },

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