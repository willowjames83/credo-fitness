import Foundation

let mockProteinToday = ProteinDay(day: "Sun", amount: 168, target: 180, hit: false, isToday: true)

let mockProteinWeek: [ProteinDay] = [
    ProteinDay(day: "Mon", amount: 185, target: 180, hit: true),
    ProteinDay(day: "Tue", amount: 190, target: 180, hit: true),
    ProteinDay(day: "Wed", amount: 140, target: 180, hit: false),
    ProteinDay(day: "Thu", amount: 182, target: 180, hit: true),
    ProteinDay(day: "Fri", amount: 178, target: 180, hit: false),
    ProteinDay(day: "Sat", amount: 195, target: 180, hit: true),
    ProteinDay(day: "Sun", amount: 168, target: 180, hit: false, isToday: true),
]

let mockSavedMeals: [SavedMeal] = [
    SavedMeal(name: "Morning Shake", grams: 40),
    SavedMeal(name: "Chicken + Rice", grams: 45),
    SavedMeal(name: "Greek Yogurt Bowl", grams: 30),
    SavedMeal(name: "Post-Workout Shake", grams: 50),
]
