"use client";

import { DarkThemeToggle } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setSigningIn(true);

    // Call API to create account
    try {
      const response = await fetch("http://localhost:8080/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        credentials: "include", // ใช้ credentials เพื่อส่ง cookies
      });

      if (!response.ok) {
        throw new Error("Failed to sign-in account");
      }

      console.log("Sign-in successfully");
      setSigningIn(false);
      router.push("/home");
    } catch (error) {
      setSigningIn(false);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  useEffect(() => {});

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
      <div className="mb-8 flex flex-col justify-center gap-8">
        <div className="mx-auto flex max-w-sm flex-col gap-2">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Your Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
              <svg
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 16"
              >
                <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
              </svg>
            </div>
            <input
              type="text"
              id="email-address-icon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="name@flowbite.com"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dark:shadow-xs-light block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-center">
            <div
              onClick={handleSubmit}
              className="flex justify-center rounded-md bg-lime-300 px-4 py-2 font-bold text-lime-700 transition-all duration-300 hover:cursor-pointer hover:bg-lime-400"
            >
              <span>
                {signingIn ? (
                  <div className="animate-infinite animate-duration-[1500ms] animate-ease-linear animate-fill-backwards animate-pulse">
                    Signing in
                  </div>
                ) : (
                  "Sign in"
                )}
              </span>
            </div>
          </div>
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    </main>
  );
}
