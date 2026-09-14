"use client";

import { FormEvent, useState } from "react";
import { createClient } from '@/lib/supabase/client';
import Link from "next/link";

export default function RegisterPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const { error } =
      await (await supabase).auth.signUp({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Account created. Check your email if email confirmation is enabled."
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">
        Create account
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-4"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          minLength={6}
          className="w-full rounded-lg border p-3"
        />

        <button
          className="w-full rounded-lg bg-black p-3 text-white"
        >
          Register
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-gray-600">
          {message}
        </p>
      )}

      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="underline"
        >
          Login
        </Link>
      </p>
    </main>
  );
}