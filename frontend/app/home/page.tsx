"use client";

import { DarkThemeToggle } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("http://localhost:8080/me", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to fetch username");
        }
        const { data } = await response.json();
        console.log(data);
        setUsername(data.username);
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };

    fetchUsername();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/sign-out", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to sign out");
      }
      console.log("Sign-out successfully");
      router.push("/");
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
      <div className="flex flex-col justify-center gap-8">
        <div className="text-7xl text-black">{username}</div>
      </div>
      <div
        className="mt-12 w-fit rounded-md bg-red-500 p-2"
        onClick={handleSignOut}
      >
        Logout
      </div>
    </main>
  );
}
