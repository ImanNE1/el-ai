import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { validateMessages } from "@/lib/sanitize";

const SYSTEM_PROMPT = `You are EL, an elite, highly intelligent AI assistant and tutor designed to provide comprehensive, Google Gemini-grade responses.

When explaining concepts, science, history, or answering informative questions:
1. **Introduction**: Open with a clear, engaging introductory paragraph establishing the background context, estimated timeframes, and primary scientific models.
2. **Chronological / Conceptual Breakdown**: Structure the body with clear numbered headings including timeline estimates where applicable (e.g., '1. Runtuhnya Awan Nebula Matahari (~4,6 Miliar Tahun Lalu)').
3. **Scientific Depth & Precision**: Explain specific mechanisms using bullet points, including chemical notations (e.g. Fe, Ni, H₂O, CO₂), key scientific vocabulary in bold, and physical processes.
4. **Concluding Synthesis**: Provide a thoughtful concluding paragraph summarizing the significance or next phase of development.
5. **Follow-up Exploration**: Provide 2-3 relevant follow-up topics under '**Topik terkait yang bisa ditelusuri lebih dalam:**'.

Tone & Language:
- Write in fluent, natural, and eloquent Indonesian (or the user's language).
- Never use telegraphic, chopped, or overly compressed sentences. Write full, flowing, grammatically complete explanations.`;

export const maxDuration = 60;

/**
 * POST /api/chat
 * Proxies chat requests to the upstream OpenAI-compatible API.
 * All secrets stay server-side.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Rate Limiting ────────────────────────────────────────────
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const maxReqs = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "20", 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

    const { allowed, remaining, resetAt } = rateLimit(ip, maxReqs, windowMs);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // ── Parse & Validate ─────────────────────────────────────────
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const validation = validateMessages(body.messages);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // ── Build upstream request ───────────────────────────────────
    const apiBase = process.env.OPENAI_API_BASE;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiBase || !apiKey) {
      console.error("Missing OPENAI_API_BASE or OPENAI_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error: Missing OPENAI_API_BASE or OPENAI_API_KEY. Harap tambahkan di Environment Variables Vercel." },
        { status: 500 }
      );
    }

    const customSystemPrompt = typeof body.systemPrompt === "string" && body.systemPrompt.trim().length > 0
      ? body.systemPrompt.trim().slice(0, 4000)
      : SYSTEM_PROMPT;

    const messages = [
      { role: "system", content: customSystemPrompt },
      ...validation.messages,
    ];

    const temperature = typeof body.temperature === "number" && body.temperature >= 0 && body.temperature <= 2
      ? body.temperature
      : 0.7;

    const upstream = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || "gh/gpt-4o-mini",
        messages,
        stream: true,
        temperature,
        max_tokens: 8192,
      }),
    });

    if (!upstream.ok) {
      const rawError = await upstream.text().catch(() => "Unknown upstream error");
      console.error(`Upstream error ${upstream.status}: ${rawError}`);

      // Default to clear limit/quota warning as requested by user
      let cleanError = "Batas penggunaan (limit/kuota) untuk model ini telah tercapai atau server sedang sibuk. Silakan coba beberapa saat lagi atau gunakan model lain seperti Gemini 3.8 Flash.";

      try {
        const parsed = JSON.parse(rawError);
        const rawMessage = (parsed.error?.message || parsed.message || "").toLowerCase();

        if (
          rawMessage.includes("credits") ||
          rawMessage.includes("402") ||
          rawMessage.includes("quota") ||
          rawMessage.includes("limit") ||
          rawMessage.includes("not supported") ||
          rawMessage.includes("not_supported") ||
          rawMessage.includes("not found") ||
          rawMessage.includes("capacity") ||
          rawMessage.includes("overloaded")
        ) {
          cleanError = "Batas penggunaan (limit/kuota) untuk model ini telah tercapai atau kapasitas sedang penuh. Silakan coba beberapa saat lagi atau gunakan model lain seperti Gemini 3.8 Flash.";
        } else if (rawMessage) {
          const innerJsonMatch = rawMessage.match(/\{.*"message":\s*"([^"]+)".*\}/);
          const innerText = innerJsonMatch && innerJsonMatch[1] ? innerJsonMatch[1] : rawMessage;
          if (
            innerText.includes("not supported") ||
            innerText.includes("not found") ||
            innerText.includes("credits") ||
            innerText.includes("limit")
          ) {
            cleanError = "Batas penggunaan (limit/kuota) untuk model ini telah tercapai. Silakan coba beberapa saat lagi atau beralih ke model lain seperti Gemini 3.8 Flash.";
          } else {
            cleanError = `Batas penggunaan (limit) tercapai: ${innerText.replace(/\[\d+\]:\s*/, "")}`;
          }
        }
      } catch {
        if (
          upstream.status === 404 ||
          upstream.status === 400 ||
          upstream.status === 402 ||
          upstream.status === 429 ||
          upstream.status === 503
        ) {
          cleanError = "Batas penggunaan (limit/kuota) untuk model ini telah tercapai atau kapasitas server sedang penuh. Silakan coba beberapa saat lagi atau gunakan model lain seperti Gemini 3.8 Flash.";
        }
      }

      return NextResponse.json(
        { error: cleanError },
        { status: upstream.status >= 500 ? 502 : upstream.status }
      );
    }

    // ── Stream response back ─────────────────────────────────────
    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
      "X-RateLimit-Remaining": String(remaining),
    });

    // Pipe the upstream SSE stream directly to the client
    return new NextResponse(upstream.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An internal error occurred." },
      { status: 500 }
    );
  }
}
