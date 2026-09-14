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
      { error: "You must be logged in." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const {
    title,
    description,
    privateInfo,
    category,
    location,
    imageUrl,
  } = body;

  if (!title || !description) {
    return NextResponse.json(
      {
        error:
          "Title and description are required.",
      },
      { status: 400 }
    );
  }

  const { data, error } =
    await supabase
      .from("found_items")
      .insert({
        finder_id: user.id,
        title,
        description,
        private_info: privateInfo || null,
        category: category || null,
        location: location || null,
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