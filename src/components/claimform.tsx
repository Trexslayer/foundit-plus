"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimForm({
  itemId,
}: {
  itemId: string;
}) {
  const router = useRouter();

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const response = await fetch(
      "/api/claims",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          message,
        }),
      }
    );

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push(`/dashboard`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4"
    >
      <textarea
        placeholder="Why do you believe this item is yours?"
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        className="min-h-32 w-full rounded-lg border p-3"
        required
      />

      <button
        disabled={loading}
        className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Claim item"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}