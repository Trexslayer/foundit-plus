import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FoundItemsPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("found_items")
    .select(
      "id,title,description,image_url,category,location,found_at,status"
    )
    .eq("status", "OPEN")
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">
        Found Items
      </h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((item) => (
          <Link
            href={`/found/${item.id}`}
            key={item.id}
            className="overflow-hidden rounded-xl border hover:shadow-md"
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="p-5">
              <h2 className="font-semibold">
                {item.title}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {item.description}
              </p>

              {item.location && (
                <p className="mt-3 text-sm">
                  Location: {item.location}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}