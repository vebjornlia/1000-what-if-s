import { openrouter, MODEL } from "@/lib/ai/openrouter";
import { ONBOARDING_SYSTEM_PROMPT, PROFILE_EXTRACTION_PROMPT } from "@/lib/ai/prompts";
import { parseProfile } from "@/lib/utils/profileExtract";

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

      // Recover the profile object defensively: the model may wrap it in
      // markdown, add prose, or return non-JSON. parseProfile never throws, so
      // a malformed response degrades to an empty profile instead of a 500 that
      // would blank the onboarding review screen.
      const profile = parseProfile(text);

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
