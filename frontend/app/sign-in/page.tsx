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
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 dark:bg-base-1100/90 px-4 py-12 font-mono">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle/>
      </div>
      <div className="w-full max-w-sm rounded-lg border border-black border-2 bg-base-150 dark:bg-base-200 p-6 shadow-[4px_4px_0px_#2f1c15]">
        <div className="-mt-6 -mx-6 rounded-t-md bg-base-300 dark:bg-base-400 py-2 text-lg font-bold text-white pl-5 flex flex-row items-center">
          <img src="/rider.png" alt="Rider Icon" className="h-9 w-9 mr-2 rounded-lg" />
          Rider
        </div>
        <h2 className="my-4 text-center text-base-1000 text-lg font-bold">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-base-1000 bg-white px-3 py-2 text-sm text-base-1000 placeholder:font-bold placeholder-[#8d6e63] shadow-inner focus:outline-none focus:ring-2 focus:ring-base-300"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-base-1000 bg-white px-3 py-2 text-sm text-base-1000 placeholder:font-bold placeholder-[#8d6e63] shadow-inner focus:outline-none focus:ring-2 focus:ring-base-300"
          />

          <button
            type="submit"
            disabled={signingIn}
            className="px-6 mx-auto block rounded-md bg-base-300 dark:bg-base-400 py-2 text-sm font-bold text-white hover:bg-base-500 transition"
          >
            {signingIn ? "Signing in..." : "Start"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <div className="mt-4 text-center text-sm text-base-1000 hover:text-base-400 underline cursor-pointer font-bold" onClick={() => router.push("/sign-up")}>
          Sign Up &gt;
        </div>
      </div>
    </main>
  );
}
