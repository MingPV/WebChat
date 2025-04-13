"use client";

import { DarkThemeToggle } from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import Link from "next/link";

const backend_url =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function Home() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setSigningUp(true);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!terms) {
      setError("You must agree to the terms and conditions");
      return;
    }
    // Call API to create account
    try {
      const response = await fetch(`${backend_url}/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          username: username,
          password: password,
          profile_url: profileUrl,
        }),
        credentials: "include", // ใช้ credentials เพื่อส่ง cookies
      });

      console.log(response);

      if (response.statusText == "Conflict") {
        setError("Email already exists");
        setSigningUp(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create account");
      }
      console.log("Sign-up successfully");
      setSigningUp(false);
      router.push("/home");
    } catch (error) {
      setSigningUp(false);
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
          <div className="">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="dark:shadow-xs-light block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              required
            />
          </div>
          <div className="">
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
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Repeat password
            </label>
            <input
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="dark:shadow-xs-light block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-5 flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="terms"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="h-4 w-4 rounded-sm border border-gray-300 bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800"
                required
              />
            </div>

            <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              I agree with the{" "}
              <a
                href="#"
                className="text-blue-600 hover:underline dark:text-blue-500"
              >
                terms and conditions
              </a>
            </label>
          </div>
          <div className="flex justify-center">
            <div
              onClick={handleSubmit}
              className="flex justify-center rounded-md bg-lime-300 px-4 py-2 font-bold text-lime-700 transition-all duration-300 hover:cursor-pointer hover:bg-lime-400"
            >
              <span>
                {signingUp ? (
                  <div className="animate-infinite animate-duration-[1500ms] animate-ease-linear animate-fill-backwards animate-pulse">
                    Creating an account
                  </div>
                ) : (
                  "Create an account"
                )}
              </span>
            </div>
          </div>
          <div className="text-red-500">{error}</div>
          <div className="flex flex-row gap-2">
            <div
              className={`flex flex-col gap-2 border p-4 hover:cursor-pointer hover:bg-lime-200 ${profileUrl === "/profile1.png" ? "bg-lime-200" : ""}`}
              onClick={() => setProfileUrl("/profile1.png")}
            >
              Profile 1
              <Image
                src={"/profile1.png"}
                alt={"profile1"}
                width={128}
                height={128}
                className="rounded-full"
              />
            </div>
            <div
              className={`flex flex-col gap-2 border p-4 hover:cursor-pointer hover:bg-lime-200 ${profileUrl === "/profile2.jpg" ? "bg-lime-200" : ""}`}
              onClick={() => setProfileUrl("/profile2.jpg")}
            >
              Profile 2
              <Image
                src={"/profile2.jpg"}
                alt={"profile1"}
                width={128}
                height={128}
                className="rounded-full"
              />
            </div>
            <div
              className={`flex flex-col gap-2 border p-4 hover:cursor-pointer hover:bg-lime-200 ${profileUrl === "/profile3.jpg" ? "bg-lime-200" : ""}`}
              onClick={() => setProfileUrl("/profile3.jpg")}
            >
              Profile 3
              <Image
                src={"/profile3.jpg"}
                alt={"profile1"}
                width={128}
                height={128}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
