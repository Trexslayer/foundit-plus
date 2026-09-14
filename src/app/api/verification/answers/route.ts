import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const {
    checkId,
    claimId,
    answer,
  } = body;

  if (
    !checkId ||
    !claimId ||
    !answer
  ) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  const { data: claim } =
    await supabase
      .from("claims")
      .select("id,item_id")
      .eq("id", claimId)
      .eq("claimant_id", user.id)
      .single();

  if (!claim) {
    return NextResponse.json(
      { error: "Claim not found." },
      { status: 404 }
    );
  }

  const { data: check } =
    await supabase
      .from("verification_checks")
      .select("id,item_id")
      .eq("id", checkId)
      .single();

  if (!check) {
    return NextResponse.json(
      { error: "Verification check not found." },
      { status: 404 }
    );
  }

  if (check.item_id !== claim.item_id) {
    return NextResponse.json(
      { error: "Invalid verification check." },
      { status: 400 }
    );
  }

  const { data, error } =
    await supabase
      .from("verification_answers")
      .insert({
        check_id: checkId,
        claim_id: claimId,
        answer,
      })
      .select()
      .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}


export async function PATCH(
  request: Request
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const {
    answerId,
    status,
  } = body;

  const allowedStatuses = [
    "ACCEPTED",
    "REJECTED",
    "CLARIFICATION",
  ];

  if (
    !answerId ||
    !allowedStatuses.includes(status)
  ) {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  /*
   * Find the answer and its associated
   * verification check.
   */
  const { data: answer } =
    await supabase
      .from("verification_answers")
      .select(
        "id,check_id,claim_id,answer,status"
      )
      .eq("id", answerId)
      .single();

  if (!answer) {
    return NextResponse.json(
      { error: "Answer not found." },
      { status: 404 }
    );
  }

  const { data: check } =
    await supabase
      .from("verification_checks")
      .select(
        "id,item_id,finder_id,question,expected_answer"
      )
      .eq("id", answer.check_id)
      .single();

  if (!check) {
    return NextResponse.json(
      { error: "Verification check not found." },
      { status: 404 }
    );
  }

  if (check.finder_id !== user.id) {
    return NextResponse.json(
      { error: "You cannot review this answer." },
      { status: 403 }
    );
  }

  /*
   * Update the answer status.
   */
  const { error: updateError } =
    await supabase
      .from("verification_answers")
      .update({ status })
      .eq("id", answerId);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  /*
   * If accepted, create a proof.
   *
   * The expected answer remains private.
   * We only store the claimant's submitted answer
   * in the proof.
   */
  if (status === "ACCEPTED") {
    const { error: proofError } =
      await supabase
        .from("proofs")
        .insert({
          item_id: check.item_id,
          claim_id: answer.claim_id,
          title: "Verification check",
          description:
            `Question: ${check.question}\n` +
            `Claimant answer: ${answer.answer}`,
          type: "OWNER_PROOF",
          status: "ACCEPTED",
          weight: 25,
        });

    if (proofError) {
      return NextResponse.json(
        { error: proofError.message },
        { status: 400 }
      );
    }
  }

  /*
   * Recalculate claim score.
   */
  const { data: proofs } =
    await supabase
      .from("proofs")
      .select("status,weight")
      .eq("claim_id", answer.claim_id);

  const totalWeight =
    proofs?.reduce(
      (sum, proof) => sum + proof.weight,
      0
    ) || 0;

  const acceptedWeight =
    proofs
      ?.filter(
        (proof) =>
          proof.status === "ACCEPTED"
      )
      .reduce(
        (sum, proof) => sum + proof.weight,
        0
      ) || 0;

  const score =
    totalWeight === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (acceptedWeight / totalWeight) *
              100
          )
        );

  await supabase
    .from("claims")
    .update({
      score,
    })
    .eq("id", answer.claim_id);

  return NextResponse.json({
    success: true,
    score,
  });
}