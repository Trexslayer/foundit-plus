"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFoundItemPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [privateInfo, setPrivateInfo] =
    useState("");
  const [category, setCategory] =
    useState("");
  const [location, setLocation] =
    useState("");
  const [imageUrl, setImageUrl] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const response = await fetch(
      "/api/items",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          privateInfo,
          category,
          location,
          imageUrl,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.error);
      return;
    }

    router.push(
      `/dashboard/found/${data.id}`
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold">
        Report Found Item
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Item title"
          required
          className="w-full rounded-lg border p-3"
        />

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Public description"
          required
          className="min-h-32 w-full rounded-lg border p-3"
        />

        <textarea
          value={privateInfo}
          onChange={(e) =>
            setPrivateInfo(e.target.value)
          }
          placeholder="Private information only you know"
          className="min-h-32 w-full rounded-lg border p-3"
        />

        <input
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          placeholder="Category"
          className="w-full rounded-lg border p-3"
        />

        <input
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
          placeholder="Where was it found?"
          className="w-full rounded-lg border p-3"
        />

        <input
          value={imageUrl}
          onChange={(e) =>
            setImageUrl(e.target.value)
          }
          placeholder="Image URL"
          className="w-full rounded-lg border p-3"
        />

        <button className="rounded-lg bg-black px-6 py-3 text-white">
          Publish Found Item
        </button>

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}