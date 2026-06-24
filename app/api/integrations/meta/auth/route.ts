import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appId = process.env.META_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/meta/callback`;

    // Permissions we need (works in Dev Mode for you, will need App Review for public users later)
    const scopes = [
        'pages_show_list',
        'pages_messaging',
        'instagram_manage_messages',
        'pages_read_engagement'
    ].join(',');

    // We pass the userId in the "state" parameter so we know who to save the token for when they come back
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${userId}&response_type=code`;

    return NextResponse.redirect(authUrl);
}