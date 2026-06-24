import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { businessesCollection } from '@/lib/astra';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const business = await businessesCollection.findOne({ business_id: userId });
  
  return NextResponse.json({ status: business?.status || 'pending' });
}