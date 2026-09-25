"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ChevronDown, Flame, Star, Timer } from "lucide-react";
import { useEffect, useState } from "react";

import { sortWorkouts, type Workout } from "@/lib/fitlog";

const sortOptions = [
  { label: "Duration", value: "duration" },
  { label: "Calories", value: "calories" },
  { label: "Rating", value: "rating" },
] as const;

export default function HomePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("duration");

  useEffect(() => {
    let active = true;

    fetch("https://api.abcz.workers.dev/api/fitlog")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(`Invalid response shape: expected array but received ${typeof data}`);
        }

        return data as Workout[];
      })
      .then((data: Workout[]) => {
        if (!active) return;
        setWorkouts(sortWorkouts(data, sortBy));
      })
      .catch((fetchError) => {
        console.error("FitLog homepage fetch failed:", fetchError);

        if (!active) return;
        setWorkouts([]);
        setError("Unable to load workouts right now. Please try again in a moment.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sortBy]);

  const renderCards = loading ? [] : sortWorkouts(workouts, sortBy);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 rounded-[2rem] border border-white/10 bg-[#111111] p-6 md:p-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.42em] text-[#ccff00]">WORKOUT LIBRARY</p>
            <h1 className="max-w-xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              TRAIN WITH INTENT. LOG EVERY SET.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#d4d4d4]">
              FitLog is a dark, no-nonsense gym companion: pick a lift, lock it into today&apos;s plan, and watch the week&apos;s work add up.
            </p>
            <a
              href="#library"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#ccff00] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#0a0a0a] transition hover:brightness-110"
            >
              Browse workouts <ArrowDown aria-hidden="true" size={16} strokeWidth={3} />
            </a>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden">
            <Image
              src="/banner.png"
              alt="FitLog banner"
              width={700}
              height={560}
              className="relative z-10 h-[420px] w-full object-contain"
              priority
            />
          </div>
        </div>
      </section>

      <section id="library" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#ccff00]">WORKOUT LIBRARY</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">THE LIBRARY</h2>
          </div>
          <div className="relative flex items-center gap-3 rounded-full border border-white/15 bg-[#111111] px-3 py-2 text-sm text-white">
            <label htmlFor="sort" className="font-semibold uppercase tracking-[0.16em] text-[#d4d4d4]">Sort By</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number]["value"])}
              className="appearance-none rounded-full border border-white/10 bg-[#0d0d0d] py-1.5 pl-3 pr-8 text-sm font-medium text-white outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-5" size={14} />
          </div>
        </div>

        <p className="mb-8 text-[#bdbdbd]">Twelve lifts covering every major muscle group.</p>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex items-center gap-3 text-[#f5f5f5]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ccff00] border-t-transparent" />
              <span className="text-lg font-medium">Loading workouts…</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-500/30 bg-red-500/5 px-6 py-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-300">API issue</p>
            <h3 className="mt-4 text-2xl font-black uppercase text-white">Unable to load workouts</h3>
            <p className="mt-3 text-[#d4d4d4]">{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {renderCards.map((workout) => (
              <Link
                key={workout.id}
                href={`/workout/${workout.id}`}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-[#ccff00]/40"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image src={workout.image} alt={workout.name} fill unoptimized className="object-cover transition duration-300 group-hover:scale-105" />
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex flex-wrap gap-2">
                    {workout.muscleGroups.slice(0, 2).map((group) => (
                      <span key={group} className="rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ccff00]">
                        {group}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-black uppercase leading-tight tracking-tight text-white">
                    {workout.name}
                  </h3>

                  <p className="text-sm text-[#d4d4d4]">{workout.equipment}</p>

                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#d4d4d4]">
                    <span className="flex items-center gap-1.5"><Timer aria-hidden="true" size={14} />{workout.duration} min</span>
                    <span className="flex items-center gap-1.5"><Flame aria-hidden="true" size={14} />{workout.caloriesBurned} kcal</span>
                    <span className="flex items-center gap-1.5"><Star aria-hidden="true" size={14} />{workout.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
