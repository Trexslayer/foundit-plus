"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function VerificationAnswerForm({
  checkId,
  claimId,
}: {
  checkId: string;
  claimId: string;
}) {
  const router = useRouter();

  const [answer, setAnswer] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch(
      "/api/verification/answers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkId,
          claimId,
          answer,
        }),
      }
    );

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error);
      return;
    }

    setAnswer("");

    setMessage(
      "Answer submitted for review."
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-3"
    >
      <textarea
        value={answer}
        onChange={(e) =>
          setAnswer(e.target.value)
        }
        placeholder="Your answer"
        required
        className="min-h-24 w-full rounded-lg border p-3"
      />

      <button
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm text-white"
      >
        {loading
          ? "Submitting..."
          : "Submit Answer"}
      </button>

      {message && (
        <p className="text-sm text-green-600">
          {message}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}