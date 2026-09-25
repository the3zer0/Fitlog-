"use client";

import Image from "next/image";
import Link from "next/link";
import { BookmarkPlus, Check, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  getStoredFitlogState,
  notify,
  persistFitlogState,
  type FitlogState,
  type Workout,
} from "@/lib/fitlog";

export default function WorkoutDetailClient({ initialWorkout }: { initialWorkout: Workout | null }) {
  const params = useParams<{ id: string }>();
  const workoutId = Number(params?.id ?? "");
  const hasValidId = !Number.isNaN(workoutId);
  const [workout, setWorkout] = useState<Workout | null>(initialWorkout);
  const [isLoading, setIsLoading] = useState(!initialWorkout && hasValidId);
  const [state, setState] = useState<FitlogState>({ plan: [], saved: [], completed: [] });

  useEffect(() => {
    const syncState = () => setState(getStoredFitlogState());
    window.addEventListener("fitlog-state-change", syncState);
    const syncTimer = window.setTimeout(syncState, 0);
    return () => {
      window.clearTimeout(syncTimer);
      window.removeEventListener("fitlog-state-change", syncState);
    };
  }, []);

  useEffect(() => {
    if (initialWorkout) {
      return;
    }

    if (!hasValidId) return;

    let active = true;
    fetch("https://api.abcz.workers.dev/api/fitlog")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const items = await res.json();

        if (!Array.isArray(items)) {
          throw new Error(`Invalid response shape: expected array but received ${typeof items}`);
        }

        return items as Workout[];
      })
      .then((items: Workout[]) => {
        if (!active) return;
        const match = items.find((item) => item.id === workoutId) ?? null;
        setWorkout(match);
      })
      .catch((fetchError) => {
        console.error("FitLog detail fetch failed:", fetchError);
        setWorkout(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasValidId, initialWorkout, params, workoutId]);

  const inPlan = useMemo(
    () => workout ? state.plan.includes(workout.id) : false,
    [state.plan, workout],
  );

  const saved = useMemo(
    () => workout ? state.saved.includes(workout.id) : false,
    [state.saved, workout],
  );

  const handleAddToPlan = () => {
    if (!workout) return;

    if (state.plan.length >= 5) {
      notify("Today's plan is full. Remove one and try again.");
      return;
    }

    const next = {
      ...state,
      plan: state.plan.includes(workout.id) ? state.plan : [...state.plan, workout.id],
    };

    persistFitlogState(next);
    setState(next);
    notify("Added to today's plan.");
  };

  const handleSaveForLater = () => {
    if (!workout) return;

    const next = {
      ...state,
      saved: state.saved.includes(workout.id) ? state.saved : [...state.saved, workout.id],
    };

    persistFitlogState(next);
    setState(next);
    notify("Saved for later.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#f5f5f5]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ccff00] border-t-transparent" />
          <span className="text-lg font-medium">Loading workout…</span>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#ccff00]">Workout not found</p>
        <h1 className="text-4xl font-black uppercase text-white">Nothing to see here</h1>
        <p className="mt-4 text-[#a3a3a3]">This lift does not exist in the library.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full border border-[#ccff00] bg-[#ccff00] px-6 py-3 font-semibold text-[#0a0a0a] transition hover:brightness-110">
          Return to workouts
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-9">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#101010]">
          <div className="relative h-[480px] w-full overflow-hidden">
            <Image
              src={workout.image}
              alt={workout.name}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white sm:text-4xl">
              {workout.name}
            </h1>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-[#bdbdbd]">{workout.description}</p>

          <div className="flex flex-wrap gap-2">
            {workout.muscleGroups.map((group) => (
              <span key={group} className="rounded-full bg-[#ccff00] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0a0a0a]">
                {group}
              </span>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#171922] px-4 py-2">
            <div className="grid text-xs text-[#d4d4d4]">
              {[
                ["Equipment", workout.equipment],
                ["Difficulty", workout.difficulty],
                ["Sets", `${workout.sets}`],
                ["Reps", workout.reps],
                ["Duration", `${workout.duration} min`],
                ["Calories", `${workout.caloriesBurned} kcal`],
                ["Rating", `${workout.rating}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b border-white/5 py-3 last:border-none">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8f929d]">{label}</span>
                  <span className="text-right font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-[0.18em] text-white">Instructions</h2>
            <ol className="space-y-3">
              {workout.instructions.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-xl border border-white/10 bg-[#101010] p-3 text-[#e7e7e7]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ccff00] text-sm font-black text-[#0a0a0a]">
                    {index + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToPlan}
              disabled={inPlan || state.plan.length >= 5}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#ccff00] px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[#0a0a0a] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inPlan ? <><Check aria-hidden="true" size={16} /> Already in today&apos;s plan</> : <><Plus aria-hidden="true" size={16} /> Add to today&apos;s plan</>}
            </button>
            <button
              type="button"
              onClick={handleSaveForLater}
              disabled={saved}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-white/20 bg-transparent px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:border-[#ccff00] hover:text-[#ccff00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saved ? <><Check aria-hidden="true" size={16} /> Saved</> : <><BookmarkPlus aria-hidden="true" size={16} /> Save for later</>}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
