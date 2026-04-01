import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful assistant. You are given the content of a document. Answer the user's prompt based on this document content. Be thorough and well-structured in your response.

CRITICAL FORMATTING RULES:
1. You MUST wrap your entire response inside <response> and </response> XML tags.
2. Do NOT use any markdown formatting (no #, *, -, \`\`\`, etc.).
3. For main headings, use: <heading>Heading Text</heading>
4. For sub headings, use: <subheading>Subheading Text</subheading>
5. For bold text inline, use: <bold>bold text</bold>
6. For bullet points, start each line with a dash and space: - Item text
7. For numbered lists, use: 1. Item text
8. For everything else, write plain text paragraphs separated by blank lines.

Example:
<response>
<heading>Document Summary</heading>

This is a regular paragraph with some <bold>important</bold> details about the document.

<subheading>Key Points</subheading>

The document covers several important topics:

1. First key point discussed
2. Second key point discussed
3. Third key point discussed

This concludes the main findings of the document.
</response>`;

function extractResponseContent(content: string): string {
  const match = content.match(/<response>([\s\S]*?)<\/response>/);
  if (match) {
    console.log("[generate] Successfully parsed content from <response> XML tags");
    return match[1].trim();
  }
  console.log("[generate] WARNING: No <response> XML tags found, using full content as fallback");
  return content.trim();
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const envModel = process.env.OPENROUTER_MODEL;

  if (!apiKey || apiKey === "your-openrouter-api-key-here") {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const { pdfText, prompt, model: requestModel } = await request.json();

    if (!pdfText || !prompt) {
      return NextResponse.json(
        { error: "pdfText and prompt are required" },
        { status: 400 }
      );
    }

    const model = requestModel || envModel;
    if (!model) {
      return NextResponse.json(
        { error: "No model specified. Select a model or set OPENROUTER_MODEL in env." },
        { status: 400 }
      );
    }

    console.log(`[generate] Using model: ${model}`);
    console.log(`[generate] Processing prompt: "${prompt.substring(0, 80)}..."`);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: `Document content:\n\n${pdfText}\n\n---\n\nPrompt: ${prompt}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData?.error?.message ||
            `OpenRouter API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    console.log(`[generate] Raw LLM response length: ${rawContent.length} chars`);

    const parsedContent = extractResponseContent(rawContent);

    console.log(`[generate] Parsed content length: ${parsedContent.length} chars`);
    console.log(`[generate] Parsed content preview: "${parsedContent.substring(0, 200)}..."`);

    return NextResponse.json({ content: parsedContent });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
