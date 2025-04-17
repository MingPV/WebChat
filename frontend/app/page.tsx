import { DarkThemeToggle } from "flowbite-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-base-100 px-4 py-24 transition-all duration-500 dark:bg-base-1100">
      <div className="absolute top-4 right-4">
        <DarkThemeToggle />
      </div>
  
      <div className="flex flex-col items-center gap-15">
        <h1 className="text-5xl font-bold text-black dark:text-base-100">Welcome to RiderChat!</h1>
  
        <div className="flex flex-row gap-20">
          <Link
            href="/sign-in"
            className="w-32 text-center rounded-lg border-2 border-black bg-base-200 px-8 py-3 text-base font-semibold text-black transition-all duration-300 hover:bg-base-300 dark:border-base-100 dark:bg-base-300 dark:text-base-100 dark:hover:bg-base-350"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="w-32 text-center rounded-lg border-2 border-black bg-base-200 px-8 py-3 text-base font-semibold text-black transition-all duration-300 hover:bg-base-300 dark:border-base-100 dark:bg-base-300 dark:text-base-100 dark:hover:bg-base-350"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );  
}
