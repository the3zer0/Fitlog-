"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Flame, Star, Timer, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getStoredFitlogState, notify, persistFitlogState, type FitlogState, type Workout } from "@/lib/fitlog";

const sortOptions = [
  { label: "Duration", value: "duration" },
  { label: "Calories", value: "calories" },
  { label: "Rating", value: "rating" },
] as const;

export default function MyPlanPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plan" | "saved">("plan");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("duration");
  const [state, setState] = useState<FitlogState>({ plan: [], saved: [], completed: [] });

  useEffect(() => {
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
      .then((data: Workout[]) => setWorkouts(data))
      .catch((fetchError) => {
        console.error("FitLog plan fetch failed:", fetchError);
        setWorkouts([]);
        setError("Unable to load your plan right now. Please try again in a moment.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const syncState = () => setState(getStoredFitlogState());
    window.addEventListener("fitlog-state-change", syncState);
    const syncTimer = window.setTimeout(syncState, 0);
    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener("fitlog-state-change", syncState);
    };
  }, []);

  const planWorkouts = useMemo(
    () => workouts.filter((workout) => state.plan.includes(workout.id)),
    [state.plan, workouts],
  );

  const savedWorkouts = useMemo(
    () => workouts.filter((workout) => state.saved.includes(workout.id)),
    [state.saved, workouts],
  );

  const activeItems = activeTab === "plan" ? planWorkouts : savedWorkouts;

  const sortedItems = useMemo(() => {
    const sorted = [...activeItems];

    sorted.sort((a, b) => {
      if (sortBy === "duration") return a.duration - b.duration;
      if (sortBy === "calories") return a.caloriesBurned - b.caloriesBurned;
      return a.rating - b.rating;
    });

    return sorted;
  }, [activeItems, sortBy]);

  const stats = useMemo(
    () => ({
      exercises: planWorkouts.length,
      minutes: planWorkouts.reduce((total, workout) => total + workout.duration, 0),
      calories: planWorkouts.reduce((total, workout) => total + workout.caloriesBurned, 0),
    }),
    [planWorkouts],
  );

  const removeFromPlan = (id: number) => {
    const next = { ...state, plan: state.plan.filter((itemId) => itemId !== id) };
    persistFitlogState(next);
    setState(next);
    notify("Removed from today's plan.");
  };

  const removeFromSaved = (id: number) => {
    const next = { ...state, saved: state.saved.filter((itemId) => itemId !== id) };
    persistFitlogState(next);
    setState(next);
    notify("Removed from saved.");
  };

  const markAsDone = (id: number) => {
    const next = {
      ...state,
      plan: state.plan.filter((itemId) => itemId !== id),
      completed: state.completed.includes(id) ? state.completed : [...state.completed, id],
    };
    persistFitlogState(next);
    setState(next);
    notify("Workout marked as done.");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-3 text-[#f5f5f5]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ccff00] border-t-transparent" />
            <span className="text-lg font-medium">Loading workouts…</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-red-500/30 bg-red-500/5 px-6 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-300">API issue</p>
          <h1 className="mt-4 text-3xl font-black uppercase text-white">Unable to load your plan</h1>
          <p className="mt-3 text-[#d4d4d4]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#ccff00]">Your plan</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white">My Plan</h1>
          <p className="mt-3 text-[#d4d4d4]">Cap of five lifts for today. Finish them, then load more.</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Exercises", value: stats.exercises },
          { label: "Minutes", value: stats.minutes },
          { label: "Calories", value: stats.calories },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a3a3a3]">{item.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3 rounded-full border border-white/10 bg-[#111111] p-2">
          {[
            { label: "Today's Plan", value: "plan" },
            { label: "Saved", value: "saved" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value as "plan" | "saved")}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition ${
                activeTab === tab.value
                  ? "bg-[#ccff00] text-[#0a0a0a]"
                  : "bg-transparent text-[#d4d4d4] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-3 rounded-full border border-white/15 bg-[#111111] px-3 py-2 text-sm text-white">
          <label htmlFor="plan-sort" className="font-semibold uppercase tracking-[0.16em] text-[#d4d4d4]">Sort By</label>
          <select
            id="plan-sort"
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

      {activeItems.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-[#111111] px-6 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#ccff00]">Nothing here yet</p>
          <h2 className="mt-4 text-3xl font-black uppercase text-white">Nothing here yet</h2>
          <p className="mx-auto mt-4 max-w-md text-[#d4d4d4]">Browse the library and add a lift to get today moving.</p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-[#ccff00] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#0a0a0a] transition hover:brightness-110"
          >
            Go to workouts
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((workout) => (
            <div key={workout.id} className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-[#111111] p-4 md:flex-row md:items-center">
              <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-white/10 md:w-40">
                <Image src={workout.image} alt={workout.name} fill unoptimized className="object-cover" />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase text-white">{workout.name}</h3>
                <p className="mt-1 text-sm text-[#d4d4d4]">{workout.equipment}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#d4d4d4]">
                  <span className="flex items-center gap-1.5"><Timer aria-hidden="true" size={14} /> {workout.duration} min</span>
                  <span className="flex items-center gap-1.5"><Flame aria-hidden="true" size={14} /> {workout.caloriesBurned} kcal</span>
                  <span className="flex items-center gap-1.5"><Star aria-hidden="true" size={14} /> {workout.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
                <Link
                  href={`/workout/${workout.id}`}
                  className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
                >
                  View Details
                </Link>
                {activeTab === "plan" ? (
                  <button
                    type="button"
                    onClick={() => markAsDone(workout.id)}
                    className="rounded-full bg-[#ccff00] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0a0a0a]"
                  >
                    <span className="inline-flex items-center gap-1.5"><Check aria-hidden="true" size={14} strokeWidth={3} /> Mark as Done</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => (activeTab === "plan" ? removeFromPlan(workout.id) : removeFromSaved(workout.id))}
                  className="rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-300"
                  aria-label={`Remove ${workout.name}`}
                >
                  <span className="inline-flex items-center gap-1.5"><X aria-hidden="true" size={14} /> Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
