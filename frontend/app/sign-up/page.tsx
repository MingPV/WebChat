"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { DarkThemeToggle } from "flowbite-react";

const backend_url =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSigningUp(true);

    if (!profileUrl) {
      setError("Please select a profile picture");
      setSigningUp(false);
      return;
    }
    if (!email) {
      setError("Please enter your email address.");
      setSigningUp(false);
      return;
    }
    if (!username) {
      setError("Please enter your username.");
      setSigningUp(false);
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      setSigningUp(false);
      return;
    }
    if (!repeatPassword) {
      setError("Please repeat your password.");
      setSigningUp(false);
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setSigningUp(false);
      return;
    }
    if (!terms) {
      setError("You must agree to the terms and conditions");
      setSigningUp(false);
      return;
    }

    try {
      const response = await fetch(`${backend_url}/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          profile_url: profileUrl,
        }),
        credentials: "include",
      });

      if (response.status === 409) {
        setError("Email already exists");
        setSigningUp(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to create account");

      setSigningUp(false);
      router.push("/home");
    } catch (error) {
      setSigningUp(false);
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
        <div className="bg-base-300 dark:bg-base-400 -mx-6 -mt-6 flex items-center rounded-t-md py-2 pl-5 text-lg font-bold text-white">
          <img src="/rider.png" alt="Rider Icon" className="mr-2 h-8 w-8" />
          Rider
        </div>

        <h2 className="my-4 text-center text-lg font-bold text-[#2f1c15]">
          Sign Up
        </h2>

        <h3 className="mt-6 mb-2 font-bold text-[#2f1c15]">Select Profile</h3>
        <div className="my-4 flex flex-wrap justify-center gap-2">
          {["/profile-1.webp", "/profile-2.jpg", "/profile-4.webp"].map(
            (url, index) => (
              <div
                key={index}
                onClick={() => setProfileUrl(url)}
                className={`cursor-pointer rounded-full border-2 transition-all duration-300 ${
                  profileUrl === url
                    ? "bg-base-200 dark:bg-base-300 border-lime-500 shadow-2xl shadow-lime-200"
                    : "bg-white"
                } hover:bg-base-200 dark:hover:bg-base-300`}
              >
                <Image
                  src={url}
                  alt={`profile${index + 1}`}
                  width={100}
                  height={100}
                  className="h-[100px] w-[100px] rounded-full object-cover"
                />
              </div>
            ),
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-[#2f1c15] bg-white px-3 py-2 text-sm text-[#2f1c15] placeholder-[#8d6e63] shadow-inner placeholder:font-bold focus:ring-2 focus:ring-[#c59d86] focus:outline-none"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-[#2f1c15] bg-white px-3 py-2 text-sm text-[#2f1c15] placeholder-[#8d6e63] shadow-inner placeholder:font-bold focus:ring-2 focus:ring-[#c59d86] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-[#2f1c15] bg-white px-3 py-2 text-sm text-[#2f1c15] placeholder-[#8d6e63] shadow-inner placeholder:font-bold focus:ring-2 focus:ring-[#c59d86] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Repeat Password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="w-full rounded-md border border-[#2f1c15] bg-white px-3 py-2 text-sm text-[#2f1c15] placeholder-[#8d6e63] shadow-inner placeholder:font-bold focus:ring-2 focus:ring-[#c59d86] focus:outline-none"
          />
          <div className="flex items-start text-sm text-[#2f1c15]">
            <input
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 mr-2 h-4 w-4 rounded border border-[#2f1c15]"
            />
            <label htmlFor="terms">
              I agree to the{" "}
              <a
                href="#"
                className="text-[#8f5c47] underline hover:text-[#6f4032]"
              >
                terms and conditions
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={signingUp}
            className="bg-base-300 dark:bg-base-400 hover:bg-base-500 mx-auto block rounded-md px-6 py-2 text-sm font-bold text-white transition"
          >
            {signingUp ? "Creating..." : "Create Account"}
          </button>

          {error && (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          )}
        </form>

        <div
          className="text-base-1000 hover:text-base-400 mt-4 cursor-pointer text-center text-sm font-bold underline"
          onClick={() => router.push("/sign-in")}
        >
          Sign In &gt;
        </div>
      </div>
    </main>
  );
}
