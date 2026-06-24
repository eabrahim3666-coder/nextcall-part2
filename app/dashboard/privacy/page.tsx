export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Privacy Policy</h1>
                <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h2>
                    <p>We collect information to provide and improve our Service. This includes:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                        <li><strong>Account Data:</strong> Name, email, and business details provided during signup.</li>
                        <li><strong>Call Data:</strong> Phone numbers, call transcripts, call recordings, and AI-generated summaries of calls made through our platform.</li>
                        <li><strong>Usage Data:</strong> Minutes used, feature usage, and device/browser information.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
                    <p>We use your data to:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                        <li>Provide the AI receptionist and call routing services.</li>
                        <li>Process billing and subscription management.</li>
                        <li>Improve AI performance and user experience.</li>
                        <li>Send critical service notifications (e.g., emergency alerts, billing issues).</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data Retention</h2>
                    <p>Active account data is retained for the duration of your subscription. If an account is cancelled, data is retained for a 30-day grace period to allow for reactivation, after which it is permanently deleted. Call recordings and transcripts are stored securely until account deletion.</p>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">4. Third-Party Services</h2>
                    <p>We use trusted third-party providers to operate our service:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                        <li><strong>Retell AI & OpenAI:</strong> For real-time voice AI processing and summarization.</li>
                        <li><strong>Twilio:</strong> For phone number provisioning and SMS/Voice routing.</li>
                        <li><strong>Clerk:</strong> For secure user authentication.</li>
                        <li><strong>Stripe:</strong> For secure payment processing.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">5. Contact</h2>
                    <p>For any privacy-related inquiries, please contact us at privacy@nextcall.com.</p>
                </div>
            </div>
        </div>
    );
}