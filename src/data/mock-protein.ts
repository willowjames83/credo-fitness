export const mockProteinToday = {
  current: 168,
  target: 180,
};

export const mockProteinWeek = [
  { day: "Mon", amount: 185, target: 180, hit: true },
  { day: "Tue", amount: 190, target: 180, hit: true },
  { day: "Wed", amount: 140, target: 180, hit: false },
  { day: "Thu", amount: 182, target: 180, hit: true },
  { day: "Fri", amount: 178, target: 180, hit: false },
  { day: "Sat", amount: 195, target: 180, hit: true },
  { day: "Sun", amount: 168, target: 180, hit: false, isToday: true },
];

export const mockSavedMeals = [
  { name: "Morning Shake", grams: 40 },
  { name: "Chicken + Rice", grams: 45 },
  { name: "Greek Yogurt Bowl", grams: 30 },
  { name: "Post-Workout Shake", grams: 50 },
];
