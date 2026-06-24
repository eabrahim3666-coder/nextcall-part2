import { NextResponse } from 'next/server';
import { businessesCollection, callsCollection, notificationsCollection } from '@/lib/astra';
import twilioClient from '@/lib/twilio';

export async function GET(request: Request) {
    // Security check: Verify the CRON_SECRET header
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date().toISOString();

        // 1. Find all businesses that are cancelled AND their deletion date has passed
        const expiredBusinesses = await businessesCollection.find({
            status: "cancelled",
            scheduled_deletion_date: { $lte: now }
        }).toArray();

        if (expiredBusinesses.length === 0) {
            return NextResponse.json({ message: "No expired accounts to clean up." });
        }

        let deletedCount = 0;
        let twilioClosedCount = 0;

        for (const business of expiredBusinesses) {
            const businessId = business.business_id;

            // 2. Delete associated data from AstraDB
            await callsCollection.deleteMany({ business_id: businessId });
            await notificationsCollection.deleteMany({ business_id: businessId });
            
            // 3. Delete the business record itself
            await businessesCollection.deleteOne({ _id: business._id });

            // 4. Close the Twilio Sub-Account (Stops recurring charges for the number!)
            if (business.twilio_subaccount_sid) {
                try {
                    await twilioClient.api.accounts(business.twilio_subaccount_sid).update({ status: 'closed' });
                    twilioClosedCount++;
                } catch (twilioError: any) {
                    console.error(`Failed to close Twilio subaccount ${business.twilio_subaccount_sid}:`, twilioError.message);
                }
            }

            deletedCount++;
        }

        console.log(`🧹 Cron Cleanup: Deleted ${deletedCount} expired accounts and closed ${twilioClosedCount} Twilio sub-accounts.`);
        return NextResponse.json({ success: true, deletedAccounts: deletedCount, closedTwilioAccounts: twilioClosedCount });

    } catch (error) {
        console.error("❌ Cron Cleanup Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}