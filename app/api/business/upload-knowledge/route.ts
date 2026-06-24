import { NextResponse } from 'next/server';
import { businessesCollection } from '@/lib/astra';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    const businessId = formData.get('business_id') as string;

    if (!file || !businessId) {
      return NextResponse.json({ error: "Missing file or business ID" }, { status: 400 });
    }

    // 1. Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 2. Extract text from PDF (Dynamic import + 'any' cast to bypass TS strictness)
    const pdfModule = await import('pdf-parse');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdf = (pdfModule as any).default || pdfModule;
    const data = await pdf(buffer);
    const extractedText = data.text;

    // 3. Save to AstraDB
    await businessesCollection.updateOne(
      { business_id: businessId },
      { $set: { knowledge_base_text: extractedText } }
    );

    console.log(`Knowledge base updated for business ${businessId}`);

    return NextResponse.json({ success: true, textLength: extractedText.length });

  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}