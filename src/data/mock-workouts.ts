export interface WorkoutSet {
  set: number;
  weight: number;
  reps: number | null;
  completed: boolean;
}

export interface Exercise {
  name: string;
  muscleGroup: string;
  sets: WorkoutSet[];
  previousSession?: string;
}

export const mockActiveWorkout = {
  name: "Lower Body + Hinge",
  week: 12,
  day: 1,
  totalDays: 3,
  elapsedTime: "32:14",
  restTimer: "1:47",
  activeExercise: {
    name: "Back Squat",
    muscleGroup: "Quads, Glutes",
    setsTarget: "4 × 6-8",
    previousSession: "175 × 8, 8, 7, 6",
    sets: [
      { set: 1, weight: 185, reps: 8, completed: true },
      { set: 2, weight: 185, reps: 8, completed: true },
      { set: 3, weight: 185, reps: null, completed: false },
      { set: 4, weight: 185, reps: null, completed: false },
    ] as WorkoutSet[],
  },
  upcomingExercises: [
    { name: "Romanian Deadlift", detail: "3 × 8-10" },
    { name: "Bulgarian Split Squat", detail: "3 × 10 each" },
    { name: "Farmer Carry", detail: "3 × 40m" },
    { name: "Hanging Knee Raise", detail: "3 × 12-15" },
  ],
};
