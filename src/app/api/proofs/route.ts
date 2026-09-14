import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const weights = {
  OWNER_PROOF: 20,
  OWNER_SUGGESTION: 20,
  FINDER_PROOF: 25,
};

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
    itemId,
    claimId,
    title,
    description,
    type,
    imageUrl,
  } = body;

  if (
    !itemId ||
    !title ||
    !description ||
    !type
  ) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (
    ![
      "OWNER_PROOF",
      "OWNER_SUGGESTION",
      "FINDER_PROOF",
    ].includes(type)
  ) {
    return NextResponse.json(
      { error: "Invalid proof type." },
      { status: 400 }
    );
  }

  if (
    type !== "FINDER_PROOF" &&
    !claimId
  ) {
    return NextResponse.json(
      {
        error:
          "A claimant proof requires a claim.",
      },
      { status: 400 }
    );
  }

  if (claimId) {
    const { data: claim } =
      await supabase
        .from("claims")
        .select("id,item_id,claimant_id")
        .eq("id", claimId)
        .single();

    if (!claim) {
      return NextResponse.json(
        { error: "Claim not found." },
        { status: 404 }
      );
    }

    if (
      claim.claimant_id !== user.id
    ) {
      return NextResponse.json(
        { error: "You cannot use this claim." },
        { status: 403 }
      );
    }

    if (claim.item_id !== itemId) {
      return NextResponse.json(
        { error: "Invalid item." },
        { status: 400 }
      );
    }
  }

  const { data, error } =
    await supabase
      .from("proofs")
      .insert({
        item_id: itemId,
        claim_id: claimId || null,
        title,
        description,
        type,
        status: "PENDING",
        weight:
          weights[
            type as keyof typeof weights
          ],
        image_url: imageUrl || null,
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
    proofId,
    status,
  } = body;

  if (
    !proofId ||
    ![
      "ACCEPTED",
      "REJECTED",
      "CLARIFICATION",
    ].includes(status)
  ) {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const { data: proof } =
    await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

  if (!proof) {
    return NextResponse.json(
      { error: "Proof not found." },
      { status: 404 }
    );
  }

  const { data: item } =
    await supabase
      .from("found_items")
      .select("finder_id")
      .eq("id", proof.item_id)
      .single();

  if (
    !item ||
    item.finder_id !== user.id
  ) {
    return NextResponse.json(
      { error: "Not authorized." },
      { status: 403 }
    );
  }

  const { error } =
    await supabase
      .from("proofs")
      .update({ status })
      .eq("id", proofId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (proof.claim_id) {
    const { data: proofs } =
      await supabase
        .from("proofs")
        .select("status,weight")
        .eq("claim_id", proof.claim_id);

    const totalWeight =
      proofs?.reduce(
        (sum, p) => sum + p.weight,
        0
      ) || 0;

    const acceptedWeight =
      proofs
        ?.filter(
          (p) => p.status === "ACCEPTED"
        )
        .reduce(
          (sum, p) => sum + p.weight,
          0
        ) || 0;

    const score =
      totalWeight === 0
        ? 0
        : Math.round(
            (acceptedWeight /
              totalWeight) *
              100
          );

    await supabase
      .from("claims")
      .update({ score })
      .eq("id", proof.claim_id);
  }

  return NextResponse.json({
    success: true,
  });
}