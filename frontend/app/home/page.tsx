"use client";

import { DarkThemeToggle } from "flowbite-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");

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
        setUsername(data.name);
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      }
    };

    fetchUsername();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
      <div className="flex flex-col justify-center gap-8">
        <div className="text-7xl">{username}</div>
      </div>
    </main>
  );
}
