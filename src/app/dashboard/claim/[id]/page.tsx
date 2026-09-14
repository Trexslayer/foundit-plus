import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerificationAnswerForm from "@/components/verificationanswerform";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: claim } =
    await supabase
      .from("claims")
      .select("*")
      .eq("id", id)
      .eq("claimant_id", user.id)
      .single();

  if (!claim) {
    notFound();
  }

  const { data: item } =
    await supabase
      .from("found_items")
      .select(
        "id,title,description,image_url"
      )
      .eq("id", claim.item_id)
      .single();

  const { data: checks } =
    await supabase
      .from("verification_checks")
      .select(
        "id,item_id,finder_id,question,created_at"
      )
      .eq("item_id", claim.item_id)
      .order("created_at", {
        ascending: true,
      });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">
        Claim: {item?.title}
      </h1>

      <div className="mt-6 rounded-xl border p-6">
        <h2 className="font-semibold">
          Your claim
        </h2>

        <p className="mt-3 text-gray-600">
          {claim.message}
        </p>

        <p className="mt-4 font-bold">
          Current score: {claim.score}%
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">
          Ownership Verification
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Answer the questions below. The finder
          will decide whether your answers are valid.
        </p>

        <div className="mt-6 space-y-5">
          {checks?.map((check) => (
            <div
              key={check.id}
              className="rounded-xl border p-5"
            >
              <h3 className="font-semibold">
                {check.question}
              </h3>

              <VerificationAnswerForm
                checkId={check.id}
                claimId={claim.id}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}