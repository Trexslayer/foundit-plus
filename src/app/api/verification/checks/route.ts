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
    itemId,
    question,
    expectedAnswer,
  } = body;

  if (
    !itemId ||
    !question ||
    !expectedAnswer
  ) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  const { data: item } =
    await supabase
      .from("found_items")
      .select("id")
      .eq("id", itemId)
      .eq("finder_id", user.id)
      .single();

  if (!item) {
    return NextResponse.json(
      { error: "You do not own this found item." },
      { status: 403 }
    );
  }

  const { data, error } =
    await supabase
      .from("verification_checks")
      .insert({
        item_id: itemId,
        finder_id: user.id,
        question,
        expected_answer: expectedAnswer,
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