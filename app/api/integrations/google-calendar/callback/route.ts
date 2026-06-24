import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';
import { businessesCollection } from '@/lib/astra';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/google-calendar/callback`
);

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || state !== userId) {
    return NextResponse.redirect(new URL('/dashboard/settings', request.url));
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      console.error("No refresh token received from Google");
      return NextResponse.redirect(new URL('/dashboard/settings', request.url));
    }

    await businessesCollection.updateOne(
      { business_id: userId },
      { $set: { 
        google_refresh_token: tokens.refresh_token,
        google_business_connected: true // Flag for the Reviews UI
      }}
    );

    return NextResponse.redirect(new URL('/dashboard/settings?focus=integrations', request.url));

  } catch (error) {
    console.error("Google Calendar Auth Error:", error);
    return NextResponse.redirect(new URL('/dashboard/settings', request.url));
  }
}