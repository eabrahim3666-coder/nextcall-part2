import { NextResponse } from 'next/server';
import { callsCollection, businessesCollection } from '@/lib/astra';
import twilioClient from '@/lib/twilio';

export async function GET(request: Request) {
    // Security check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        // Look for appointments happening in the next 2 hours
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        // 1. Find calls where an appointment was booked, reminder NOT sent yet, and time is upcoming
        const upcomingAppointments = await callsCollection.find({
            appointment_booked: true,
            reminder_sent: { $ne: true },
            appointment_date_time: { 
                $gte: now.toISOString(), 
                $lte: twoHoursFromNow.toISOString() 
            },
            customer_phone: { $nin: [null, ""] }
        }).toArray();

        if (upcomingAppointments.length === 0) {
            return NextResponse.json({ message: "No upcoming appointments need reminders." });
        }

        let remindersSent = 0;

        for (const appt of upcomingAppointments) {
            // 2. Check if the business has reminders turned ON
            const business = await businessesCollection.findOne({ business_id: appt.business_id });
            
            if (!business || !business.routing_rules?.appointment_reminders) continue;
            if (!business.twilio_number) continue; // Need a number to text from

            try {
                // 3. Format the time nicely (e.g., "2:30 PM")
                const apptTime = new Date(appt.appointment_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                // 4. Send the SMS Reminder
                await twilioClient.messages.create({
                    body: `Reminder: You have an appointment with ${business.business_name || 'us'} at ${apptTime} today. Reply CALL to have us call you, or reply HELP if you need to reschedule.`,
                    from: business.twilio_number,
                    to: appt.customer_phone
                });

                // 5. Mark as sent so we don't spam them again
                await callsCollection.updateOne(
                    { _id: appt._id },
                    { $set: { reminder_sent: true } }
                );

                remindersSent++;
                console.log(`Sent reminder to ${appt.customer_phone} for ${business.business_name}`);

            } catch (smsError) {
                console.error(`Failed to send reminder for call ${appt.call_id}:`, smsError);
            }
        }

        return NextResponse.json({ success: true, remindersSent });

    } catch (error) {
        console.error("Appointment Reminder Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}