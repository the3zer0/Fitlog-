import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[#d4d4d4] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="FitLog logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-lg font-black uppercase tracking-[0.2em] text-white">FitLog</span>
        </div>

        <p className="text-sm text-[#d4d4d4]">
          © 2026 FitLog — Workout Library. Train hard, log honest.
        </p>
      </div>
    </footer>
  );
}
