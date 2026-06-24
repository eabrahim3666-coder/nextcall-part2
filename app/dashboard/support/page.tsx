export const dynamic = 'force-dynamic';

export default function SupportPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Center</h1>
                <p className="mt-2 text-sm text-gray-500">Need help? We're here for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Card 1: Documentation */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Documentation</h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Before reaching out, please check our comprehensive Setup Guide and Rules. Most common questions about AI training and testing are answered there.
                    </p>
                    <a href="/dashboard/docs" className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-2">
                        View Documentation →
                    </a>
                </div>

                {/* Card 2: Email Support */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Email Support</h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        For account issues, billing inquiries, or technical bugs, email our support team directly. We respond within 24 hours on business days.
                    </p>
                    <a href="mailto:support@nextcall.com" className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-2">
                        support@nextcall.com
                    </a>
                </div>

                {/* Card 3: System Status */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">System Status</h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        If your AI status pill is red, or calls aren't connecting, check our real-time status page for any ongoing outages with Twilio, OpenAI, or our servers.
                    </p>
                    <span className="inline-block text-sm font-medium text-green-600">
                        ● All Systems Operational
                    </span>
                </div>

                {/* Card 4: Feature Requests */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Feature Requests</h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Want nextCall to do more? We build features based on user demand. Let us know what integrations or AI capabilities would help your business grow.
                    </p>
                    <a href="mailto:feedback@nextcall.com" className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors underline underline-offset-2">
                        Send Feedback →
                    </a>
                </div>

            </div>
        </div>
    );
}