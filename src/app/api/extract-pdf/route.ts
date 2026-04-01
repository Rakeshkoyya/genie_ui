import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const { text, totalPages } = await extractText(pdf, { mergePages: true });

    return NextResponse.json({
      text,
      pageCount: totalPages,
      filename: file.name,
    });
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
