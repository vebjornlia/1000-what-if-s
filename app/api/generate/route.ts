import { openrouter, MODEL } from "@/lib/ai/openrouter";
import { createClient } from "@/lib/supabase/server";
import { getWhatIfGenerationPrompt } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const { batchSize = 50, batchNumber = 1 } = await request.json();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("structured_profile")
    .eq("id", user.id)
    .single();

  if (!profile?.structured_profile) {
    return Response.json({ error: "No profile found. Complete onboarding first." }, { status: 400 });
  }

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

  let opportunities;
  try {
    opportunities = JSON.parse(text);
  } catch {
    // Try to extract JSON from the response
    const match = text.match(/\[[\s\S]*\]/);
    opportunities = match ? JSON.parse(match[0]) : [];
  }

  // Calculate starting card index for this batch
  const { count } = await supabase
    .from("what_ifs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const startIndex = count || 0;

  // Insert into DB
  const rows = opportunities.map(
    (
      opp: {
        emoji: string;
        category: string;
        recipient_name: string;
        recipient_description: string;
        message_subject: string;
        message_body: string;
      },
      i: number
    ) => ({
      user_id: user.id,
      batch_number: batchNumber,
      card_index: startIndex + i,
      emoji: opp.emoji,
      category: opp.category,
      recipient_name: opp.recipient_name,
      recipient_description: opp.recipient_description || "",
      message_subject: opp.message_subject || "",
      message_body: opp.message_body,
      status: "unseen",
    })
  );

  const { error } = await supabase.from("what_ifs").insert(rows);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ generated: rows.length, totalCards: startIndex + rows.length });
}
