import { NextResponse } from 'next/server';
import { businessesCollection } from '@/lib/astra';

export async function GET() {
    try {
        // Find ALL business records in the database
        const allBusinesses = await businessesCollection.find({}).toArray();

        const summary = allBusinesses.map(b => ({
            business_id: b.business_id,
            business_name: b.business_name,
            status: b.status,
            plan: b.plan,
            has_meta_page_id: !!b.meta_page_id,
            meta_page_id: b.meta_page_id || "NONE"
        }));

        return NextResponse.json({
            total_records: allBusinesses.length,
            businesses: summary
        });

    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}