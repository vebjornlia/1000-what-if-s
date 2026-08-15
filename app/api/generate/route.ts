import { openrouter, MODEL } from "@/lib/ai/openrouter";
import { createClient } from "@/lib/supabase/server";
import { getWhatIfGenerationPrompt } from "@/lib/ai/prompts";
import { parseOpportunityList } from "@/lib/utils/opportunityList";

export const maxDuration = 60; // Allow up to 60s for AI generation

export async function POST(request: Request) {
  try {
    const { batchSize = 20, batchNumber = 1 } = await request.json();
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: "Unauthorized", detail: authError?.message },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("structured_profile")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.structured_profile) {
      return Response.json(
        {
          error: "No profile found. Complete onboarding first.",
          detail: profileError?.message,
        },
        { status: 400 }
      );
    }

    // Generate what-ifs via AI
    const prompt = getWhatIfGenerationPrompt(
      JSON.stringify(profile.structured_profile, null, 2),
      batchSize
    );

    const response = await openrouter.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content || "[]";

    // The model is asked for a bare JSON array but may wrap it in code fences,
    // prose, or an object (e.g. { opportunities: [...] }). Recover the array in
    // all those shapes; an empty result means no usable opportunities.
    const opportunities = parseOpportunityList<{
      emoji?: string;
      category?: string;
      recipient_name?: string;
      recipient_description?: string;
      recipient_contact?: string;
      message_subject?: string;
      message_body?: string;
    }>(text);

    if (opportunities.length === 0) {
      return Response.json(
        { error: "AI returned no opportunities", raw: text.slice(0, 200) },
        { status: 500 }
      );
    }

    // Get current card count
    const { count } = await supabase
      .from("what_ifs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const startIndex = count || 0;

    // Build rows
    const rows = opportunities.map(
      (opp, i) => ({
        user_id: user.id,
        batch_number: batchNumber,
        card_index: startIndex + i,
        emoji: opp.emoji || "✨",
        category: opp.category || "General",
        recipient_name: opp.recipient_name || "Unknown",
        recipient_description: opp.recipient_description || "",
        recipient_contact: opp.recipient_contact || "",
        message_subject: opp.message_subject || "",
        message_body: opp.message_body || "",
        status: "unseen",
      })
    );

    const { error: insertError } = await supabase.from("what_ifs").insert(rows);

    if (insertError) {
      return Response.json(
        { error: "Failed to save", detail: insertError.message },
        { status: 500 }
      );
    }

    return Response.json({
      generated: rows.length,
      totalCards: startIndex + rows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
