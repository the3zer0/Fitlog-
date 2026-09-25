import type { Metadata } from "next";
import { notFound } from "next/navigation";

import WorkoutDetailClient from "./WorkoutDetailClient";
import { type Workout } from "@/lib/fitlog";

type WorkoutResult = {
  workout: Workout | null;
  failed: boolean;
};

async function getWorkout(id: string): Promise<WorkoutResult> {
  try {
    const response = await fetch(`https://api.abcz.workers.dev/api/fitlog/${id}`, { cache: "no-store" });

    if (!response.ok) {
      return { workout: null, failed: response.status >= 500 };
    }

    const payload = await response.json();

    return { workout: payload as Workout, failed: false };
  } catch (error) {
    console.error("FitLog detail route fetch failed:", error);
    return { workout: null, failed: true };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await getWorkout(id);
  const workout = result.workout;

  return {
    title: workout ? `${workout.name} | FitLog` : "Workout not found | FitLog",
    description: workout ? workout.description : "Workout details for FitLog app.",
  };
}

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getWorkout(id);

  if (!result.workout && !result.failed) {
    notFound();
  }

  return <WorkoutDetailClient initialWorkout={result.workout} />;
}
