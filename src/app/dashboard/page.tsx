import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: items } =
    await supabase
      .from("found_items")
      .select("*")
      .eq("finder_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  const { data: claims } =
  await supabase
    .from("claims")
    .select("*")
    .eq("claimant_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <Link
          href="/dashboard/found/new"
          className="rounded-lg bg-black px-5 py-3 text-white"
        >
          Report Found Item
        </Link>
      </div>

      <h2 className="mt-12 text-xl font-semibold">
        Items you've found
      </h2>

      <div className="mt-6 space-y-4">
        {items?.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/found/${item.id}`}
            className="block rounded-xl border p-5 hover:shadow"
          >
            <h3 className="font-semibold">
              {item.title}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {item.description}
            </p>

            <p className="mt-3 text-xs uppercase">
              {item.status}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          My Claims
        </h2>

        <div className="mt-5 space-y-4">
          {claims?.map((claim) => (
          <Link
            key={claim.id}
            href={`/dashboard/claim/${claim.id}`}
            className="block rounded-xl border p-5"
          >
          <div className="flex justify-between">
            <span>
              Claim #{claim.id.slice(0, 8)}
            </span>
            <strong>
              {claim.score}%
            </strong>
          </div>

          <p className="mt-2 text-sm text-gray-600">
            {claim.status}
          </p>
          </Link>
          ))}
        </div>
      </section>
    </main>
  );
}