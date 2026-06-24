import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Change this to your actual support email when you have a custom domain
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "onboarding@resend.dev";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, topic, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const topicLabels: Record<string, string> = {
            general: "General Question",
            pricing: "Pricing & Plans",
            integration: "Integrations",
            demo: "Demo Request",
            support: "Technical Support",
            partnership: "Partnership",
        };

        const { data, error } = await resend.emails.send({
            from: "NextCall <support@getnextcall.com>", // MUST match your verified domain!
            to: [SUPPORT_EMAIL],
            subject: `[Next Call] ${topicLabels[topic] || "New Question"} from ${name}`,
            html: `
                <div style="background:#0a0a0a;padding:32px;border-radius:16px;font-family:Inter,sans-serif;color:#fff;max-width:500px;">
                    <h2 style="margin:0 0 20px;font-size:18px;color:#fff;">New Question from Landing Page</h2>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:8px 0;color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;width:100px;">Name</td>
                            <td style="padding:8px 0;color:#fff;font-size:14px;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Email</td>
                            <td style="padding:8px 0;color:#818cf8;font-size:14px;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Topic</td>
                            <td style="padding:8px 0;color:#fff;font-size:14px;">${topicLabels[topic] || topic}</td>
                        </tr>
                    </table>
                    <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
                        <p style="margin:0;color:#737373;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Message</p>
                        <p style="margin:0;color:#d4d4d4;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
                    </div>
                    <p style="margin:20px 0 0;color:#525252;font-size:11px;">Sent from Next Call Chat landing page</p>
                </div>
            `,
        });

        if (error) {
            console.error("Email error:", error);
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Contact error:", error.message || error);
        // Return the actual error message so the frontend can see it
        return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
    }
}