/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DarkThemeToggle } from "flowbite-react";

const backend_url =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSigningIn(true);

    if (!email) {
      setError("Please enter your email address.");
      setSigningIn(false);
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      setSigningIn(false);
      return;
    }
    try {
      const response = await fetch(`${backend_url}/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to sign-in account");

      setSigningIn(false);
      router.push("/home");
    } catch (error) {
      setSigningIn(false);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  return (
    <main className="bg-base-100 dark:bg-base-1100/90 flex min-h-screen items-center justify-center px-4 py-12 font-mono">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
      <div className="bg-base-150 dark:bg-base-200 w-full max-w-sm rounded-lg border border-2 border-black p-6 shadow-[4px_4px_0px_#2f1c15]">
        <div className="bg-base-300 dark:bg-base-400 -mx-6 -mt-6 flex flex-row items-center rounded-t-md py-2 pl-5 text-lg font-bold text-white">
          <img
            src="/rider.png"
            alt="Rider Icon"
            className="mr-2 h-9 w-9 rounded-lg"
          />
          Rider
        </div>
        <h2 className="text-base-1000 my-4 text-center text-lg font-bold">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-base-1000 text-base-1000 focus:ring-base-300 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder-[#8d6e63] shadow-inner placeholder:font-bold focus:ring-2 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-base-1000 text-base-1000 focus:ring-base-300 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder-[#8d6e63] shadow-inner placeholder:font-bold focus:ring-2 focus:outline-none"
          />

          <button
            type="submit"
            disabled={signingIn}
            className="bg-base-300 dark:bg-base-400 hover:bg-base-500 mx-auto block rounded-md px-6 py-2 text-sm font-bold text-white transition"
          >
            {signingIn ? "Signing in..." : "Start"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <div
          className="text-base-1000 hover:text-base-400 mt-4 cursor-pointer text-center text-sm font-bold underline"
          onClick={() => router.push("/sign-up")}
        >
          Sign Up &gt;
        </div>
      </div>
    </main>
  );
}
