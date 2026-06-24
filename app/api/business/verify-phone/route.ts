import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

interface OtpData {
    code: string;
    expires: number;
    lastSent: number;
    sendCount: number;
    verifyAttempts: number;
}

// In-memory store (use Redis/DB in production for persistence)
const otpStore: Record<string, OtpData> = {};

const MAX_SENDS = 4;         // Ban on 4th attempt
const WARNING_SENDS = 3;     // Warn on 3rd attempt
const COOLDOWN_MS = 60_000;  // 60 seconds between sends
const EXPIRY_MS = 5 * 60_000; // 5 minute OTP expiry
const RESET_MS = 30 * 60_000; // Reset counts after 30 mins

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { phone, code, action } = body;
        const key = `${userId}_${phone}`;

        // ========== SEND OTP ==========
        if (action === "send") {
            let data = otpStore[key] || {
                code: "", expires: 0, lastSent: 0, sendCount: 0, verifyAttempts: 0,
            };

            // Reset counts after 30 minutes
            if (data.lastSent && Date.now() - data.lastSent > RESET_MS) {
                data.sendCount = 0;
                data.verifyAttempts = 0;
            }

            // Check if banned (4+ sends)
            if (data.sendCount >= MAX_SENDS) {
                return NextResponse.json({
                    error: "Too many attempts. This number is temporarily locked. Try again in 30 minutes.",
                    banned: true,
                }, { status: 429 });
            }

            // Check 60s cooldown
            if (data.lastSent && Date.now() - data.lastSent < COOLDOWN_MS) {
                const waitSeconds = Math.ceil((COOLDOWN_MS - (Date.now() - data.lastSent)) / 1000);
                return NextResponse.json({
                    error: `Please wait ${waitSeconds}s before resending`,
                    cooldown: waitSeconds,
                }, { status: 429 });
            }

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            otpStore[key] = {
                code: otp,
                expires: Date.now() + EXPIRY_MS,
                lastSent: Date.now(),
                sendCount: data.sendCount + 1,
                verifyAttempts: 0,
            };

            // ===== PRODUCTION: Send via Twilio SMS =====
            // Uncomment when you have Twilio keys:
            //
            // const twilio = require("twilio");
            // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            // await client.messages.create({
            //     body: `Your nextCall code is: ${otp}. It expires in 5 minutes.`,
            //     from: process.env.TWILIO_PHONE_NUMBER,
            //     to: phone,
            // });
            //

            console.log(`🔐 OTP for ${phone}: ${otp} (send #${data.sendCount + 1})`);

            // Build response
            const response: Record<string, any> = { success: true };
            if (process.env.NODE_ENV === "development") {
                response.dev_otp = otp;
            }

            // Add warning on 3rd send
            if (data.sendCount + 1 >= WARNING_SENDS) {
                response.warning = "⚠️ This is your last resend attempt. One more will lock this number for 30 minutes.";
            }

            response.sends_remaining = MAX_SENDS - (data.sendCount + 1);

            return NextResponse.json(response);
        }

        // ========== VERIFY OTP ==========
        if (action === "verify") {
            const data = otpStore[key];

            if (!data) {
                return NextResponse.json({ success: false, verified: false, error: "No code found. Request a new one." }, { status: 400 });
            }

            // Check expiry
            if (Date.now() > data.expires) {
                delete otpStore[key];
                return NextResponse.json({ success: false, verified: false, error: "Code expired. Request a new one." }, { status: 400 });
            }

            // Rate limit wrong guesses (5 max)
            if (data.verifyAttempts >= 5) {
                delete otpStore[key];
                return NextResponse.json({ success: false, verified: false, error: "Too many wrong attempts. Request a new code." }, { status: 400 });
            }

            // Check code
            if (data.code === code) {
                delete otpStore[key];
                return NextResponse.json({ success: true, verified: true });
            }

            // Wrong code
            data.verifyAttempts += 1;
            otpStore[key] = data;
            const remaining = 5 - data.verifyAttempts;

            return NextResponse.json({
                success: false,
                verified: false,
                error: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
            }, { status: 400 });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Verify error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}