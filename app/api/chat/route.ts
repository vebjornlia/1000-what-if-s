import { openrouter, MODEL } from "@/lib/ai/openrouter";
import { ONBOARDING_SYSTEM_PROMPT, PROFILE_EXTRACTION_PROMPT } from "@/lib/ai/prompts";
import { parseJsonObject } from "@/lib/utils/parseJson";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { messages, action } = await request.json();

    // Profile extraction
    if (action === "extract_profile") {
      const conversationText = messages
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join("\n");

      const response = await openrouter.chat.completions.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: PROFILE_EXTRACTION_PROMPT },
          { role: "user", content: conversationText },
        ],
      });

      const text = response.choices[0]?.message?.content || "{}";

      // The model is untrusted: it may wrap the object in code fences/prose or
      // emit malformed JSON. Recover the object best-effort and fall back to an
      // empty (still-editable) profile rather than 500-ing, which would bounce
      // the user out of onboarding and lose the conversation.
      const profile = parseJsonObject(text) ?? {};

      return Response.json({ profile });
    }

    // Regular conversation
    const response = await openrouter.chat.completions.create({
      model: MODEL,
      max_tokens: 512,
      messages: [
        { role: "system", content: ONBOARDING_SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    return Response.json({ message: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
