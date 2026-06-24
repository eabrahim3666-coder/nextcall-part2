import { NextResponse } from 'next/server';
import { businessesCollection, callsCollection } from '@/lib/astra';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
    // Security check to prevent unauthorized execution
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Calculate yesterday's date range
        const now = new Date();
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Find all active businesses
        const activeBusinesses = await businessesCollection.find({ status: "active" }).toArray();

        for (const business of activeBusinesses) {
            // Find calls for this business that occurred yesterday
            const calls = await callsCollection.find({
                business_id: business.business_id,
                created_at: { $gte: yesterdayStart.toISOString(), $lt: yesterdayEnd.toISOString() }
            }).toArray();

            // Only send an email if there were actually calls
            if (calls.length > 0) {
                const totalMinutes = calls.reduce((sum, call) => sum + ((call.call_duration || 0) / 60), 0);
                const positiveCalls = calls.filter(c => c.sentiment === "Positive").length;
                const flaggedCalls = calls.filter(c => c.is_flagged).length;

                // Send via Resend (using your verified domain)
                await resend.emails.send({
                    from: 'NextCall Updates <updates@your-verified-domain.com>',
                    to: business.email, // Ensure business documents have an email field
                    subject: `Your NextCall Daily Summary - ${calls.length} Calls Processed`,
                    html: `
                        <div style="font-family: sans-serif; color: #fff; background: #050505; padding: 32px;">
                            <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Daily Call Summary</h2>
                            <p style="color: #94a3b8; margin-bottom: 24px;">Here's your AI receptionist activity for yesterday.</p>
                            
                            <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 16px; border-radius: 12px; flex: 1;">
                                    <p style="color: #a3a3a3; font-size: 12px; text-transform: uppercase;">Total Calls</p>
                                    <p style="font-size: 24px; font-weight: bold; color: #fff;">${calls.length}</p>
                                </div>
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 16px; border-radius: 12px; flex: 1;">
                                    <p style="color: #a3a3a3; font-size: 12px; text-transform: uppercase;">Minutes Used</p>
                                    <p style="font-size: 24px; font-weight: bold; color: #fff;">${totalMinutes.toFixed(1)}</p>
                                </div>
                            </div>

                            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 16px; border-radius: 12px; margin-bottom: 24px;">
                                <p style="color: #a3a3a3; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Highlights</p>
                                <p style="color: #22d3ee; font-size: 14px;">${positiveCalls} Positive</p>
                                <p style="color: #f87171; font-size: 14px;">${flaggedCalls} Flagged for Review</p>
                            </div>

                            <a href="https://your-app-url.com/dashboard/calls" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                                View Call Log
                            </a>
                        </div>
                    `,
                });
            }
        }

        return NextResponse.json({ success: true, businessesProcessed: activeBusinesses.length });
    } catch (error) {
        console.error('Daily summary cron failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}