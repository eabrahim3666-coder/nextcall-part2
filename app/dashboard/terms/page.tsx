export const dynamic = 'force-dynamic';

export default function TermsOfServicePage() {
    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Terms of Service</h1>
                <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                    <p>By accessing and using nextCall, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the service.</p>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">2. Subscription & Billing</h2>
                    <p>nextCall operates on a recurring subscription basis. By subscribing, you authorize us to charge the designated payment method on a monthly basis. Overage minutes (if applicable) are billed automatically. Refunds are not provided for partial months.</p>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">3. Acceptable Use Policy</h2>
                    <p>You agree not to use nextCall for any unlawful purpose, spam, harassment, or deceptive practices. You are responsible for ensuring compliance with local telemarketing and recording laws (including disclosure of AI and recording to callers).</p>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">4. Limitation of Liability</h2>
                    <p>nextCall provides AI-driven services. While we strive for high accuracy, AI may occasionally generate incorrect summaries or fail to identify emergencies. nextCall is not a replacement for 911 or professional emergency dispatch services. We are not liable for damages arising from AI misinterpretations.</p>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">5. Termination</h2>
                    <p>We reserve the right to terminate or suspend accounts that violate these terms. Upon cancellation by the user, accounts enter a 30-day grace period before permanent data deletion.</p>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">6. Contact</h2>
                    <p>For questions regarding these terms, please contact legal@nextcall.com.</p>
                </div>
            </div>
        </div>
    );
}