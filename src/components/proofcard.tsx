"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Answer = {
  id: string;
  check_id: string;
  claim_id: string;
  answer: string;
  status: string;
};

export default function ProofCard({
  answer,
  question,
}: {
  answer: Answer;
  question: string;
}) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function review(
    status:
      | "ACCEPTED"
      | "REJECTED"
      | "CLARIFICATION"
  ) {
    setLoading(true);

    const response = await fetch(
      "/api/verification/answers",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answerId: answer.id,
          status,
        }),
      }
    );

    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-xs text-gray-500">
        Question
      </p>

      <p className="mt-1 font-medium">
        {question}
      </p>

      <p className="mt-4 text-xs text-gray-500">
        Claimant answer
      </p>

      <p className="mt-1">
        {answer.answer}
      </p>

      <p className="mt-3 text-sm">
        Status: {answer.status}
      </p>

      {answer.status === "PENDING" && (
        <div className="mt-4 flex gap-2">
          <button
            disabled={loading}
            onClick={() =>
              review("ACCEPTED")
            }
            className="rounded bg-black px-3 py-2 text-sm text-white"
          >
            Accept
          </button>

          <button
            disabled={loading}
            onClick={() =>
              review("REJECTED")
            }
            className="rounded border px-3 py-2 text-sm"
          >
            Reject
          </button>

          <button
            disabled={loading}
            onClick={() =>
              review("CLARIFICATION")
            }
            className="rounded border px-3 py-2 text-sm"
          >
            Clarification
          </button>
        </div>
      )}
    </div>
  );
}