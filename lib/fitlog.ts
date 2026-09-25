export type Workout = {
  id: number;
  name: string;
  image: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  duration: number;
  caloriesBurned: number;
  sets: number;
  reps: string;
  rating: number;
  description: string;
  instructions: string[];
};

export type FitlogState = {
  plan: number[];
  saved: number[];
  completed: number[];
};

export const STORAGE_KEY = "fitlog-state-v1";
export const TOAST_EVENT = "fitlog-toast";
export const STATE_EVENT = "fitlog-state-change";

export function getStoredFitlogState(): FitlogState {
  if (typeof window === "undefined") return { plan: [], saved: [], completed: [] };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { plan: [], saved: [], completed: [] };

    const parsed = JSON.parse(raw) as Partial<FitlogState>;
    return {
      plan: Array.isArray(parsed.plan) ? parsed.plan.filter((id): id is number => typeof id === "number") : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved.filter((id): id is number => typeof id === "number") : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id): id is number => typeof id === "number") : [],
    };
  } catch {
    return { plan: [], saved: [], completed: [] };
  }
}

export function persistFitlogState(state: FitlogState): FitlogState {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: state }));
  }

  return state;
}

export function notify(message: string): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message } }));
}

export function sortWorkouts(items: Workout[], type: "duration" | "calories" | "rating") {
  const sorted = [...items];

  if (type === "duration") {
    sorted.sort((a, b) => b.duration - a.duration);
  }

  if (type === "calories") {
    sorted.sort((a, b) => b.caloriesBurned - a.caloriesBurned);
  }

  if (type === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
  }

  return sorted;
}
