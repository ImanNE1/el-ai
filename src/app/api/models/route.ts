import { NextResponse } from "next/server";

// Comprehensive map of verified models with their exact UI display names from the gateway
const VERIFIED_MODEL_NAMES: Record<string, string> = {
  // Antigravity Verified Models
  "ag/gemini-3.8-flash-high": "Gemini 3.8 Flash (High)",
  "ag/gemini-3.8-flash-medium": "Gemini 3.8 Flash (Medium)",
  "ag/gemini-3.8-flash-low": "Gemini 3.8 Flash (Low)",
  "ag/gemini-3.8-flash": "Gemini 3.8 Flash",
  "ag/gemini-3.7-flash-high": "Gemini 3.7 Flash (High)",
  "ag/gemini-3.7-flash-medium": "Gemini 3.7 Flash (Medium)",
  "ag/gemini-3.7-flash-low": "Gemini 3.7 Flash (Low)",
  "ag/gemini-3.6-flash-high": "Gemini 3.6 Flash (High)",
  "ag/gemini-3.6-flash-medium": "Gemini 3.6 Flash (Medium)",
  "ag/gemini-3.6-flash-low": "Gemini 3.6 Flash (Low)",
  "ag/gemini-3.1-pro-high": "Gemini 3.1 Pro (High)",
  "ag/gemini-pro-agent": "Gemini 3.1 Pro (Agent)",
  "ag/gemini-3.1-pro-low": "Gemini 3.1 Pro (Low)",
  "ag/claude-sonnet-5-5-high": "Claude Sonnet 5.5 (High)",
  "ag/claude-sonnet-5-5-medium": "Claude Sonnet 5.5 (Medium)",
  "ag/claude-sonnet-5-5-low": "Claude Sonnet 5.5 (Low)",
  "ag/claude-sonnet-5-5": "Claude Sonnet 5.5 (Thinking)",
  "ag/claude-opus-5-5-high": "Claude Opus 5.5 (High)",
  "ag/claude-opus-5-5-medium": "Claude Opus 5.5 (Medium)",
  "ag/claude-opus-5-5-low": "Claude Opus 5.5 (Low)",
  "ag/claude-opus-5-5": "Claude Opus 5.5 (Thinking)",
  "ag/claude-sonnet-4-6": "Claude Sonnet 4.6 (Thinking)",
  "ag/claude-opus-4-6-thinking": "Claude Opus 4.6 (Thinking)",
  "ag/gpt-oss-120b-medium": "GPT-OSS 120B (Medium)",

  // Additional Tested & Working Gateway Models
  "gh/gpt-4o-mini": "GPT-4o Mini (Default)",
  "gh/gpt-4o": "GPT-4o Omnimodal",
  "gh/gpt-4.1": "GPT-4.1 (1M Context)",
  "gh/gpt-3.5-turbo": "GPT-3.5 Turbo",
  "cx/gpt-5.5": "GPT-5.5 Flagship",
  "cx/gpt-5.6-luna[1m]": "GPT-5.6 Luna [1M]",
  "cx/gpt-reserve": "GPT Reserve",
  "gcli/grok-4.7": "Grok 4.7 Reasoning",
};

interface UpstreamModel {
  id: string;
  owned_by?: string;
  capabilities?: {
    vision?: boolean;
    reasoning?: boolean;
    contextWindow?: number;
    maxOutput?: number;
  };
}

export async function GET() {
  try {
    const apiBase = process.env.OPENAI_API_BASE;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiBase || !apiKey) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const res = await fetch(`${apiBase}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch models." },
        { status: 502 }
      );
    }

    const data = await res.json();

    const models = (data.data || []).map((m: UpstreamModel) => {
      const isKnownVerified = m.id in VERIFIED_MODEL_NAMES || m.id.startsWith("ag/");
      const requiresCredits = m.id.startsWith("kc/");
      const provider = m.id.startsWith("ag/")
        ? "ag"
        : m.owned_by || m.id.split("/")[0] || "unknown";

      const cleanName =
        VERIFIED_MODEL_NAMES[m.id] ||
        (m.id.startsWith("ag/")
          ? m.id.replace("ag/", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : m.id.split("/").pop() || m.id);

      const isReasoning =
        m.capabilities?.reasoning ??
        (m.id.includes("thinking") ||
          m.id.includes("high") ||
          m.id.includes("reasoner") ||
          m.id.includes("grok") ||
          m.id.includes("opus"));

      const isRecommended =
        m.id === "ag/gemini-3.8-flash-medium" ||
        m.id === "ag/gemini-3.8-flash-high" ||
        m.id === "ag/claude-sonnet-4-6" ||
        m.id === "ag/claude-opus-4-6-thinking" ||
        m.id === "gh/gpt-4o-mini" ||
        m.id === "cx/gpt-5.5";

      return {
        id: m.id,
        name: cleanName,
        rawName: m.id.split("/").pop() || m.id,
        provider,
        vision: m.capabilities?.vision ?? true,
        reasoning: isReasoning,
        contextWindow: m.capabilities?.contextWindow || 128000,
        status: isKnownVerified ? "verified" : requiresCredits ? "credits_required" : "standard",
        isRecommended,
      };
    });

    // Sort order:
    // 1. ag/gemini-3.8-flash-medium first
    // 2. Antigravity verified models (ag/) & Recommended
    // 3. Other verified models (gh, cx, gcli)
    // 4. Standard models
    // 5. Credits required (kc/)
    models.sort((a: { id: string; isRecommended: boolean; provider: string; status: string; name: string }, b: { id: string; isRecommended: boolean; provider: string; status: string; name: string }) => {
      if (a.id === "ag/gemini-3.8-flash-medium") return -1;
      if (b.id === "ag/gemini-3.8-flash-medium") return 1;

      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;

      const aIsAg = a.provider === "ag";
      const bIsAg = b.provider === "ag";
      if (aIsAg && !bIsAg) return -1;
      if (!aIsAg && bIsAg) return 1;

      if (a.status === "verified" && b.status !== "verified") return -1;
      if (a.status !== "verified" && b.status === "verified") return 1;

      if (a.status !== "credits_required" && b.status === "credits_required") return -1;
      if (a.status === "credits_required" && b.status !== "credits_required") return 1;

      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch models." },
      { status: 500 }
    );
  }
}
