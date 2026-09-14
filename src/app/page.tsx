import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            FoundIt+
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Find what you lost.
            <br />
            Prove what is yours.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-600">
            FoundIt+ connects people who find lost belongings
            with the people who actually own them.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/found"
              className="rounded-lg bg-black px-6 py-3 text-white"
            >
              Browse Found Items
            </Link>

            <Link
              href="/dashboard/found/new"
              className="rounded-lg border px-6 py-3"
            >
              Report Found Item
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}