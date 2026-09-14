"use client";

import {
  FormEvent,
  useState,
} from "react";

export default function ProofForm({
  itemId,
  claimId,
}: {
  itemId: string;
  claimId: string;
}) {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [type, setType] = useState<
    "OWNER_PROOF" | "OWNER_SUGGESTION"
  >("OWNER_PROOF");

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setMessage("");

    const response = await fetch(
      "/api/proofs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          claimId,
          title,
          description,
          type,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.error || "Failed to submit proof."
      );
      return;
    }

    setTitle("");
    setDescription("");

    setMessage(
      "Proof submitted for review."
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4"
    >
      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        placeholder="Proof title"
        required
        className="w-full rounded-lg border p-3"
      />

      <textarea
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        placeholder="Describe your proof"
        required
        className="min-h-32 w-full rounded-lg border p-3"
      />

      <select
        value={type}
        onChange={(e) =>
          setType(
            e.target.value as
              | "OWNER_PROOF"
              | "OWNER_SUGGESTION"
          )
        }
        className="w-full rounded-lg border p-3"
      >
        <option value="OWNER_PROOF">
          Evidence
        </option>

        <option value="OWNER_SUGGESTION">
          Suggest a verification check
        </option>
      </select>

      <button className="rounded-lg bg-black px-5 py-3 text-white">
        Submit
      </button>

      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}
    </form>
  );
}