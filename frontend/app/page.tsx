import { DarkThemeToggle } from "flowbite-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-24 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
      <div className="flex flex-col justify-center gap-8">
        <div className="text-7xl">{"Let's Chat"}</div>
        <div className="mb-16 flex flex-row justify-center gap-8">
          <Link
            className="rounded-md px-4 py-2 transition-all duration-300 hover:bg-lime-500"
            href={"/sign-in"}
          >
            Login
          </Link>
          <Link
            className="rounded-md px-4 py-2 transition-all duration-300 hover:bg-lime-500"
            href={"/sign-up"}
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
