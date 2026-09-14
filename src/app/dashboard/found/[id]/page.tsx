import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerificationCheckForm from "@/components/verificationcheckform";
import ProofCard from "@/components/proofcard";

export default async function FinderItemPage({
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

  const { data: item } =
    await supabase
      .from("found_items")
      .select("*")
      .eq("id", id)
      .eq("finder_id", user.id)
      .single();

  if (!item) {
    notFound();
  }

  const { data: claims } =
    await supabase
      .from("claims")
      .select("*")
      .eq("item_id", id)
      .order("created_at", {
        ascending: false,
      });

  const { data: checks } =
    await supabase
      .from("verification_checks")
      .select("*")
      .eq("item_id", id)
      .order("created_at", {
        ascending: false,
      });

  const { data: proofs } =
    await supabase
      .from("proofs")
      .select("*")
      .eq("item_id", id)
      .order("created_at", {
        ascending: false,
      });

  const { data: answers } =
    await supabase
      .from("verification_answers")
      .select("*")
      .in(
        "check_id",
        checks?.map((c) => c.id) || []
      );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">
        {item.title}
      </h1>

      <div className="mt-8 rounded-xl border bg-gray-50 p-6">
        <h2 className="font-bold">
          Private Finder Information
        </h2>

        <p className="mt-3">
          {item.private_info ||
            "No private information added."}
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">
          Create Verification Check
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          The claimant will see the question,
          but never the expected answer.
        </p>

        <VerificationCheckForm itemId={id} />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">
          Verification Checks
        </h2>

        <div className="mt-5 space-y-4">
          {checks?.map((check) => {
            const checkAnswers =
              answers?.filter(
                (answer) =>
                  answer.check_id === check.id
              ) || [];

            return (
              <div
                key={check.id}
                className="rounded-xl border p-5"
              >
                <h3 className="font-semibold">
                  {check.question}
                </h3>

                <p className="mt-2 text-sm">
                  Expected answer:
                  <span className="ml-2 font-medium">
                    {check.expected_answer}
                  </span>
                </p>

                <div className="mt-4 space-y-3">
                  {checkAnswers.map(
                    (answer) => (
                      <ProofCard
                        key={answer.id}
                        answer={answer}
                        question={
                          check.question
                        }
                      />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">
          Claims
        </h2>

        <div className="mt-5 space-y-4">
          {claims?.map((claim) => (
            <div
              key={claim.id}
              className="rounded-xl border p-5"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">
                  Claim
                </h3>

                <span className="font-bold">
                  {claim.score}%
                </span>
              </div>

              <p className="mt-3 text-gray-600">
                {claim.message}
              </p>

              <p className="mt-3 text-sm">
                Status: {claim.status}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">
          Proofs
        </h2>

        <div className="mt-5 space-y-4">
          {proofs?.map((proof) => (
            <div
              key={proof.id}
              className="rounded-xl border p-5"
            >
              <h3 className="font-semibold">
                {proof.title}
              </h3>

              <p className="mt-2 text-gray-600">
                {proof.description}
              </p>

              <p className="mt-3 text-sm">
                {proof.type} · {proof.status}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}