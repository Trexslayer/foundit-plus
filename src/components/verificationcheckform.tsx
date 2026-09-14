"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerificationCheckForm({
  itemId,
}: {
  itemId: string;
}) {
  const router = useRouter();

  const [question, setQuestion] =
    useState("");

  const [expectedAnswer, setExpectedAnswer] =
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
      "/api/verification/checks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          question,
          expectedAnswer,
        }),
      }
    );

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error);
      return;
    }

    setQuestion("");
    setExpectedAnswer("");

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 space-y-4 rounded-xl border p-5"
    >
      <input
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        placeholder="Question for claimant"
        required
        className="w-full rounded-lg border p-3"
      />

      <input
        value={expectedAnswer}
        onChange={(e) =>
          setExpectedAnswer(e.target.value)
        }
        placeholder="Expected answer — private"
        required
        className="w-full rounded-lg border p-3"
      />

      <button
        disabled={loading}
        className="rounded-lg bg-black px-5 py-3 text-white"
      >
        {loading
          ? "Creating..."
          : "Create Verification Check"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}