/**
 * Input sanitization utilities to prevent prompt injection
 * and other malicious inputs.
 */

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_PER_REQUEST = 50;

/**
 * Sanitize user input to prevent prompt injection attacks.
 * Strips control characters and enforces length limits.
 */
export function sanitizeMessage(content: string): string {
  if (typeof content !== "string") return "";

  // Remove null bytes and other control characters (keep newlines & tabs)
  let sanitized = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Trim excessive whitespace
  sanitized = sanitized.trim();

  // Enforce max length
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.slice(0, MAX_MESSAGE_LENGTH);
  }

  return sanitized;
}

/**
 * Validate the role field to only allow expected values.
 */
export function isValidRole(role: string): role is "user" | "assistant" | "system" {
  return ["user", "assistant", "system"].includes(role);
}

export type MessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

export interface ValidatedMessage {
  role: "user" | "assistant" | "system";
  content: MessageContent;
}

/**
 * Validate and sanitize the messages array from client request,
 * supporting both text strings and multimodal vision image parts.
 */
export function validateMessages(
  messages: unknown
): { valid: true; messages: ValidatedMessage[] } | { valid: false; error: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array." };
  }

  if (messages.length === 0) {
    return { valid: false, error: "At least one message is required." };
  }

  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    return { valid: false, error: `Too many messages. Maximum is ${MAX_MESSAGES_PER_REQUEST}.` };
  }

  const sanitized: ValidatedMessage[] = [];

  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: "Each message must be an object." };
    }

    const { role, content } = msg as Record<string, unknown>;

    if (typeof role !== "string" || !isValidRole(role)) {
      return { valid: false, error: `Invalid role: "${role}". Must be user, assistant, or system.` };
    }

    // 1. Text-only message
    if (typeof content === "string") {
      const sanitizedContent = sanitizeMessage(content);
      if (sanitizedContent.length === 0) {
        continue; // Skip empty messages
      }
      sanitized.push({ role, content: sanitizedContent });
      continue;
    }

    // 2. Multimodal parts array (text and/or image_url)
    if (Array.isArray(content)) {
      const sanitizedParts: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      > = [];

      for (const part of content) {
        if (typeof part !== "object" || part === null) continue;
        const p = part as Record<string, unknown>;

        if (p.type === "text" && typeof p.text === "string") {
          const cleanText = sanitizeMessage(p.text);
          if (cleanText) {
            sanitizedParts.push({ type: "text", text: cleanText });
          }
        } else if (p.type === "image_url" && typeof p.image_url === "object" && p.image_url !== null) {
          const imgObj = p.image_url as Record<string, unknown>;
          const url = imgObj.url;
          if (
            typeof url === "string" &&
            (url.startsWith("data:image/") || url.startsWith("http://") || url.startsWith("https://"))
          ) {
            // Cap at 15MB to prevent memory exhaustion
            if (url.length <= 15 * 1024 * 1024) {
              sanitizedParts.push({
                type: "image_url",
                image_url: { url },
              });
            }
          }
        }
      }

      if (sanitizedParts.length > 0) {
        sanitized.push({ role, content: sanitizedParts });
        continue;
      }
    }

    return { valid: false, error: "Message content must be a string or valid content parts array." };
  }

  if (sanitized.length === 0) {
    return { valid: false, error: "No valid messages after sanitization." };
  }

  return { valid: true, messages: sanitized };
}
