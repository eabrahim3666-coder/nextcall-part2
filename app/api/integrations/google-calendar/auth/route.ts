import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@clerk/nextjs/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/google-calendar/callback`
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events', // Read/write events
    'https://www.googleapis.com/auth/business.manage', // Read/Reply to Google Reviews
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // CRITICAL: This ensures we get a refresh token
    scope: scopes,
    prompt: 'consent', // Forces Google to give us a refresh token every time
    state: userId // Pass user ID to verify in callback
  });

  return NextResponse.redirect(url);
}