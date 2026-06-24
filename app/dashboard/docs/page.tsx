import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function DocsPage({ searchParams }: { searchParams: { focus?: string } }) {
    const focusStep = searchParams.focus;

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Documentation & Guidelines</h1>
                <p className="mt-2 text-gray-500 text-lg">Everything you need to know about using nextCall effectively and safely.</p>
            </div>

            {/* Setup Guide - Deep Link Target */}
            <div className={`bg-white border rounded-2xl shadow-sm p-6 transition-all duration-500 ${focusStep ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Setup Guide</h2>
                <p className="text-sm text-gray-500 mb-6">Follow these specific instructions to get your AI live.</p>

                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue={focusStep === 'step1' ? 'step-1' : focusStep === 'step2' ? 'step-2' : focusStep === 'step3' ? 'step-3' : undefined}
                >
                    <AccordionItem value="step-1" className={`border rounded-lg mb-3 px-4 transition-colors ${focusStep === 'step1' ? 'bg-blue-50 border-blue-200' : ''}`}>
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">
                            Step 1: How to train your AI
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 space-y-3 pt-2">
                            <p>Your AI is only as good as the instructions you give it. You must fill out the Knowledge Base in your Settings page so it knows how to represent your business.</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Navigate to the <strong>Settings</strong> page from the top navigation bar.</li>
                                <li>Under <strong>Business Identity</strong>, ensure your Business Type and Service Area are accurate. This helps the AI reject callers outside your zone.</li>
                                <li>Under <strong>AI Knowledge Base</strong>, click "View Template Guide" to see our professional formatting structure.</li>
                                <li>Fill in your operating hours, exact services offered, pricing rules, and strict exclusions (what you DO NOT do).</li>
                                <li>Click <strong>Save Settings</strong>. Your AI will instantly update and use this new brain on the next call.</li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step-2" className={`border rounded-lg mb-3 px-4 transition-colors ${focusStep === 'step2' ? 'bg-blue-50 border-blue-200' : ''}`}>
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">
                            Step 2: How to test your AI
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 space-y-3 pt-2">
                            <p>Testing ensures your AI represents your business perfectly before real customers interact with it.</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Use a phone that is <strong>not</strong> your business mobile (use a friend's phone or a landline).</li>
                                <li>Dial your <strong>Active nextCall Number</strong> exactly as it is displayed on your Dashboard.</li>
                                <li>The AI will answer with your business name. Ask it a question about your services to verify it uses your Knowledge Base.</li>
                                <li>Test the Emergency Protocol: Use an urgent keyword (like "leak", "urgent", or "emergency"). Verify that you receive the Urgent SMS alert on your business mobile.</li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="step-3" className={`border rounded-lg mb-3 px-4 transition-colors ${focusStep === 'step3' ? 'bg-blue-50 border-blue-200' : ''}`}>
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">
                            Step 3: How to update your website & Google Profile
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 space-y-3 pt-2">
                            <p>To ensure all your leads are captured, you must route your incoming calls through nextCall.</p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li><strong>Google Business Profile:</strong> Log into your Google Business dashboard. Go to the "Phone" section and replace your old mobile number with your new nextCall Active Number.</li>
                                <li><strong>Your Website:</strong> Update the "Contact Us" phone number on your website with your nextCall number.</li>
                                <li><strong>Marketing Materials:</strong> If you have flyers, business cards, or van decals, order new ones with the nextCall number.</li>
                            </ol>
                            <p className="text-sm text-red-600 font-medium pt-2">Warning: Do NOT delete your old number immediately. Keep it active for 30 days to catch stragglers, then set up call forwarding to your nextCall number.</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* How It Works */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">How does the AI answer my phones?</AccordionTrigger>
                        <AccordionContent className="text-gray-600">When a customer dials your nextCall number, our AI instantly picks up. It greets the caller using your business name, asks how it can help, and follows the specific instructions you set in your Settings page.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">How does the AI handle emergencies?</AccordionTrigger>
                        <AccordionContent className="text-gray-600">If a caller uses urgent keywords, the AI instantly triggers an alert. It will simultaneously send you an Urgent SMS and attempt a Warm Transfer to your mobile phone.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">How do I get Google Reviews automatically?</AccordionTrigger>
                        <AccordionContent className="text-gray-600">At the end of a call, the AI will politely ask the customer if they'd like to leave a review. Later, you can click "Request Review" on your Dashboard, and the system will text the customer your Google Review link.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Rules & Regulations */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Rules & Regulations</h2>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="rules-1">
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">Acceptable Use Policy</AccordionTrigger>
                        <AccordionContent className="text-gray-600">nextCall is designed for legitimate business communication. You may not use the service for spamming, illegal activities, harassment, or deceptive practices.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="rules-2">
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">Data Privacy & Consent</AccordionTrigger>
                        <AccordionContent className="text-gray-600">By using nextCall, you are responsible for ensuring that your callers are aware their call may be answered by an AI and recorded.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="rules-3">
                        <AccordionTrigger className="text-gray-800 font-medium hover:text-blue-600">Billing & Minute Limits</AccordionTrigger>
                        <AccordionContent className="text-gray-600">Your subscription includes a set amount of minutes per month. If you exceed your limit, your AI status will turn off. You can upgrade your plan or wait for your monthly cycle to reset.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Important Warnings */}
            <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-red-700 mb-4">Important Warnings</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-bold text-gray-900">Not a Replacement for 911</h3>
                        <p className="text-sm text-gray-700 mt-1">While our AI detects urgent keywords, it is NOT a life-saving service. nextCall is a business tool, not an emergency dispatcher.</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-bold text-gray-900">AI Hallucinations</h3>
                        <p className="text-sm text-gray-700 mt-1">The AI is highly intelligent but may occasionally provide incorrect information if your Knowledge Base is unclear. Keep your instructions precise.</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-bold text-gray-900">Number Deletion is Permanent</h3>
                        <p className="text-sm text-gray-700 mt-1">If you delete a phone number from your dashboard, it is permanently removed. Always update your website before deleting a number.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}