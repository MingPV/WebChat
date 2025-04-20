export default function Home() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-24 transition-all duration-500"
      style={{ backgroundImage: "url('/bg5.jpg')" }}
    >
      {/* Neon Glow Frame */}
      <div className="relative rounded-xl border-2 border-white p-26 shadow-[0_0_25px_6px_rgba(240,72,153,0.6)] backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-20 text-center">
          <h1 className="dark:text-base-100 text-base-100 text-5xl font-bold">
            Welcome to RiderChat!
          </h1>

          <div className="flex flex-col items-center space-y-5">
            <div className="flex flex-row gap-20">
              <a
                href="/sign-in"
                className="hover:bg-base-300 dark:border-base-100 dark:bg-base-300 dark:text-base-100 dark:hover:bg-base-350 text-base-100 border-base-200 rounded-lg border-2 bg-transparent px-8 py-3 text-center text-xl font-semibold backdrop-blur-lg transition-all duration-300"
              >
                Login
              </a>
              <a
                href="/publicChat"
                className="hover:bg-base-300 dark:border-base-200 dark:bg-base-300 dark:text-base-100 dark:hover:bg-base-350 border-base-200 text-base-100 rounded-lg border-2 bg-transparent px-8 py-3 text-center text-xl font-semibold backdrop-blur-lg transition-all duration-300"
              >
                Global Chat
              </a>
            </div>

            <p className="dark:text-base-100 text-base-100 text-base">
              Don’t have an account?{" "}
              <a href="/sign-up" className="hover:text-base-200 underline">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
