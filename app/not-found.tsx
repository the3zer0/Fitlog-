import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#ccff00]">404</p>
        <h1 className="mt-4 text-4xl font-black uppercase text-white sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-lg text-[#d4d4d4]">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#ccff00] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#0a0a0a] transition hover:brightness-110"
        >
          Back to workouts
        </Link>
      </div>
    </main>
  );
}
