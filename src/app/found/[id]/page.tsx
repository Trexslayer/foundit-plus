import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClaimForm from '@/components/claimform';

export default async function FoundItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: item } = await supabase
    .from("found_items")
    .select(
      "id,title,description,image_url,category,location,found_at,status,finder_id"
    )
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="overflow-hidden rounded-xl border">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="max-h-[500px] w-full object-cover"
          />
        )}

        <div className="p-8">
          <h1 className="text-3xl font-bold">
            {item.title}
          </h1>

          <p className="mt-4 text-gray-600">
            {item.description}
          </p>

          {item.category && (
            <p className="mt-4">
              <strong>Category:</strong>{" "}
              {item.category}
            </p>
          )}

          {item.location && (
            <p className="mt-2">
              <strong>Found near:</strong>{" "}
              {item.location}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-bold">
          Is this yours?
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Submit a claim and provide evidence
          that helps the finder verify ownership.
        </p>

        <ClaimForm itemId={item.id} />
      </div>
    </main>
  );
}