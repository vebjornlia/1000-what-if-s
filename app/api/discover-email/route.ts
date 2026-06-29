import { openrouter, MODEL_CHEAP } from "@/lib/ai/openrouter";
import { createClient } from "@/lib/supabase/server";
import { getEmailDiscoveryPrompt } from "@/lib/ai/prompts";
import { resolveBestEmail } from "@/lib/utils/email";
import type { DiscoveredEmail } from "@/lib/hooks/useWhatIfs";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { whatIfIds } = await request.json();

    if (!whatIfIds || !Array.isArray(whatIfIds) || whatIfIds.length === 0) {
      return Response.json(
        { error: "whatIfIds array is required" },
        { status: 400 }
      );
    }

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

    // Fetch the what-if records
    const { data: whatIfs, error: fetchError } = await supabase
      .from("what_ifs")
      .select(
        "id, recipient_name, recipient_description, category, recipient_contact"
      )
      .in("id", whatIfIds)
      .eq("user_id", user.id);

    if (fetchError || !whatIfs || whatIfs.length === 0) {
      return Response.json(
        { error: "No what-ifs found", detail: fetchError?.message },
        { status: 404 }
      );
    }

    // Mark as searching
    await supabase
      .from("what_ifs")
      .update({ email_discovery_status: "searching" })
      .in(
        "id",
        whatIfs.map((w) => w.id)
      );

    // Process each what-if
    const results: {
      id: string;
      discovered_emails: DiscoveredEmail[];
      resolved_contact: string;
      email_discovery_status: string;
    }[] = [];

    for (const whatIf of whatIfs) {
      try {
        const prompt = getEmailDiscoveryPrompt(
          whatIf.recipient_name,
          whatIf.recipient_description || "",
          whatIf.category || "",
          whatIf.recipient_contact || ""
        );

        const response = await openrouter.chat.completions.create({
          model: MODEL_CHEAP,
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        });

        const text = response.choices[0]?.message?.content || "[]";

        let candidates: DiscoveredEmail[];
        try {
          candidates = JSON.parse(text);
        } catch {
          const match = text.match(/\[[\s\S]*\]/);
          candidates = match ? JSON.parse(match[0]) : [];
        }

        const { validCandidates, bestEmail, status } =
          resolveBestEmail<DiscoveredEmail>(
            candidates,
            whatIf.recipient_contact || ""
          );

        await supabase
          .from("what_ifs")
          .update({
            discovered_emails: validCandidates,
            resolved_contact: bestEmail,
            email_discovery_status: status,
          })
          .eq("id", whatIf.id);

        results.push({
          id: whatIf.id,
          discovered_emails: validCandidates,
          resolved_contact: bestEmail,
          email_discovery_status: status,
        });
      } catch {
        // On failure for individual item, mark as not_found and continue
        await supabase
          .from("what_ifs")
          .update({ email_discovery_status: "not_found" })
          .eq("id", whatIf.id);

        results.push({
          id: whatIf.id,
          discovered_emails: [],
          resolved_contact: whatIf.recipient_contact || "",
          email_discovery_status: "not_found",
        });
      }
    }

    return Response.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
