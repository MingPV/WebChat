import { DarkThemeToggle } from "flowbite-react";
import Link from "next/link";

export default function Home() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-center bg-cover bg-no-repeat px-4 py-24 transition-all duration-500"
      style={{ backgroundImage: "url('/bg5.jpg')" }}
    >

      {/* Neon Glow Frame */}
      <div className="relative rounded-xl border-2 border-white p-26 shadow-[0_0_25px_6px_rgba(240,72,153,0.6)]">
        <div className="flex flex-col items-center space-y-20 text-center">
          <h1 className="text-5xl font-bold text-black dark:text-base-100">
            Welcome to RiderChat!
          </h1>

          <div className="flex flex-col items-center space-y-5">
            <div className="flex flex-row gap-20">
              <Link
                href="/sign-in"
                className="text-center rounded-lg border-2 border-black bg-base-200 px-8 py-3 text-xl font-semibold text-black transition-all duration-300 hover:bg-base-300 dark:border-base-100 dark:bg-base-300 dark:text-base-100 dark:hover:bg-base-350"
              >
                Login
              </Link>
              <Link
                href="/publicChat"
                className="text-center rounded-lg border-2 border-black bg-base-200 px-8 py-3 text-xl font-semibold text-black transition-all duration-300 hover:bg-base-300 dark:border-base-100 dark:bg-base-300 dark:text-base-100 dark:hover:bg-base-350"
              >
                Global Chat
              </Link>
            </div>

            <p className="text-base text-black dark:text-base-100">
              Don’t have an account?{' '}
              <Link href="/sign-up" className="underline hover:text-base-200">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
