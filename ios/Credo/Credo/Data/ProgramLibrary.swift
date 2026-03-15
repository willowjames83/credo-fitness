import Foundation

struct ProgramLibrary {

    // MARK: - All Programs

    static let allPrograms: [WorkoutProgram] = [
        longevityFoundations,
        attiaStrength,
        hubermanWeekly,
        startingStrength,
        simpleSinister,
        strengthFocus
    ]

    static func find(_ id: String) -> WorkoutProgram? {
        allPrograms.first { $0.id == id }
    }

    // MARK: - A) Longevity Foundations (3 days/week, Beginner)
    // Dan John's 5 essential patterns (push, pull, hinge, squat, carry)
    // McGill Big 3 stability warmup every session
    // Farmer carry finisher every session

    static let longevityFoundations = WorkoutProgram(
        id: "longevity_foundations_3day",
        name: "Longevity Foundations",
        shortDescription: "Dan John's 5 essential movement patterns with McGill stability warmups and loaded carries every session.",
        description: "Built on Dan John's principle that all human movement reduces to five patterns — push, pull, hinge, squat, and carry — this program adds Stuart McGill's Big 3 core exercises as a non-negotiable warmup. Every session ends with farmer carries, which both Attia and Dan John consider among the most important exercises for real-world function. Linear progression keeps it simple: add weight when you hit the top of the rep range. Perfect for beginners or anyone returning to training with a longevity mindset.",
        daysPerWeek: 3,
        difficulty: "Beginner",
        focus: "Longevity",
        days: [
            // Day A: Squat & Push
            WorkoutProgramDay(
                id: "lf_day_a",
                label: "Squat & Push",
                muscleGroups: ["Quads", "Glutes", "Chest", "Core"],
                exercises: [
                    // McGill Big 3 warmup
                    WorkoutProgramExercise(id: "bird_dog", sets: 3, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3 warmup — hold 5 sec each rep"),
                    WorkoutProgramExercise(id: "mcgill_curlup", sets: 3, repMin: 6, repMax: 6, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3 — hold 8-10 sec, descending pyramid: 6-4-2"),
                    WorkoutProgramExercise(id: "side_plank", sets: 3, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3 — 20 sec per side"),
                    // Main work
                    WorkoutProgramExercise(id: "goblet_squat", sets: 3, repMin: 8, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "Dan John's teaching squat — sit between your knees"),
                    WorkoutProgramExercise(id: "bench_press", sets: 3, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "barbell_row", sets: 3, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: "Pull balance for every push"),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 3, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks — grip and core. Target: ½ bodyweight per hand")
                ]
            ),
            // Day B: Hinge & Pull
            WorkoutProgramDay(
                id: "lf_day_b",
                label: "Hinge & Pull",
                muscleGroups: ["Hamstrings", "Glutes", "Back", "Core"],
                exercises: [
                    WorkoutProgramExercise(id: "bird_dog", sets: 3, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3 warmup"),
                    WorkoutProgramExercise(id: "mcgill_curlup", sets: 3, repMin: 6, repMax: 6, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3"),
                    WorkoutProgramExercise(id: "side_plank", sets: 3, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3 — 20 sec per side"),
                    WorkoutProgramExercise(id: "deadlift", sets: 3, repMin: 5, repMax: 5, restSeconds: 180, isOptional: false, supersetGroupId: nil, notes: "The foundational hinge pattern"),
                    WorkoutProgramExercise(id: "pullup", sets: 3, repMin: 5, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: "Scale with bands if needed"),
                    WorkoutProgramExercise(id: "ohp", sets: 3, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: "Push balance"),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 3, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks")
                ]
            ),
            // Day C: Full Body + Power
            WorkoutProgramDay(
                id: "lf_day_c",
                label: "Full Body & Power",
                muscleGroups: ["Full Body", "Core", "Power"],
                exercises: [
                    WorkoutProgramExercise(id: "bird_dog", sets: 3, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3 warmup"),
                    WorkoutProgramExercise(id: "mcgill_curlup", sets: 3, repMin: 6, repMax: 6, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3"),
                    WorkoutProgramExercise(id: "side_plank", sets: 3, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "McGill Big 3 — 20 sec per side"),
                    WorkoutProgramExercise(id: "back_squat", sets: 3, repMin: 6, repMax: 8, restSeconds: 150, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "incline_db_press", sets: 3, repMin: 10, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "cable_row", sets: 3, repMin: 10, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "med_ball_slam", sets: 3, repMin: 8, repMax: 10, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Power preservation — explosive fast-twitch training"),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 3, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks")
                ]
            )
        ],
        progressionScheme: .linearProgression
    )

    // MARK: - B) Attia Strength Protocol (4 days/week, Intermediate)
    // Upper/Lower split with stability pre-work every session
    // Inspired by Attia's personal training: hex bar deadlifts, hip thrusts,
    // goblet squats, farmer carries, and monthly A/B periodization

    static let attiaStrength = WorkoutProgram(
        id: "attia_strength_4day",
        name: "Attia Strength Protocol",
        shortDescription: "Attia's 4-pillar framework: stability warmup, compound strength, loaded carries every session.",
        description: "Modeled on Peter Attia's personal training approach, this upper/lower split integrates stability work before every session, emphasizes exercises with the highest carryover to real-world function (hex bar deadlifts, hip thrusts, goblet squats, farmer carries), and uses monthly A/B periodization — alternating strength blocks (4-6 reps) with hypertrophy blocks (8-12 reps). The Centenarian Decathlon philosophy drives exercise selection: every movement maps to a task you'll want to perform in your marginal decade.",
        daysPerWeek: 4,
        difficulty: "Intermediate",
        focus: "Longevity",
        days: [
            // Upper A: Strength
            WorkoutProgramDay(
                id: "attia_upper_a",
                label: "Upper Strength",
                muscleGroups: ["Chest", "Back", "Shoulders", "Core"],
                exercises: [
                    // Stability block
                    WorkoutProgramExercise(id: "bird_dog", sets: 2, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "mcgill_curlup", sets: 2, repMin: 6, repMax: 6, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "side_plank", sets: 2, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "20 sec per side"),
                    WorkoutProgramExercise(id: "dead_hang", sets: 2, repMin: 30, repMax: 30, restSeconds: 30, isOptional: false, supersetGroupId: nil, notes: "30 sec hold — work toward 2 min (Attia benchmark)"),
                    // Main work
                    WorkoutProgramExercise(id: "bench_press", sets: 4, repMin: 4, repMax: 6, restSeconds: 150, isOptional: false, supersetGroupId: nil, notes: "Schedule A: strength range"),
                    WorkoutProgramExercise(id: "barbell_row", sets: 4, repMin: 4, repMax: 6, restSeconds: 150, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "db_ohp", sets: 3, repMin: 6, repMax: 8, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "face_pull", sets: 3, repMin: 12, repMax: 15, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Shoulder health — external rotation at top"),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 3, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks — target ½ BW per hand")
                ]
            ),
            // Lower A: Strength
            WorkoutProgramDay(
                id: "attia_lower_a",
                label: "Lower Strength",
                muscleGroups: ["Quads", "Glutes", "Hamstrings", "Core"],
                exercises: [
                    WorkoutProgramExercise(id: "bird_dog", sets: 2, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "mcgill_curlup", sets: 2, repMin: 6, repMax: 6, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "side_plank", sets: 2, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "20 sec per side"),
                    WorkoutProgramExercise(id: "trap_bar_deadlift", sets: 4, repMin: 4, repMax: 6, restSeconds: 180, isOptional: false, supersetGroupId: nil, notes: "Attia's preferred deadlift variation — safer spine position"),
                    WorkoutProgramExercise(id: "goblet_squat", sets: 3, repMin: 8, repMax: 10, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "Quality squat pattern work"),
                    WorkoutProgramExercise(id: "hip_thrust", sets: 3, repMin: 8, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "Glute strength for hip extension capacity"),
                    WorkoutProgramExercise(id: "bulgarian_split_squat", sets: 3, repMin: 8, repMax: 10, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "Unilateral — critical for balance and fall prevention"),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 3, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks")
                ]
            ),
            // Upper B: Hypertrophy
            WorkoutProgramDay(
                id: "attia_upper_b",
                label: "Upper Hypertrophy",
                muscleGroups: ["Chest", "Back", "Shoulders", "Arms"],
                exercises: [
                    WorkoutProgramExercise(id: "bird_dog", sets: 2, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "mcgill_curlup", sets: 2, repMin: 6, repMax: 6, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "side_plank", sets: 2, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "20 sec per side"),
                    WorkoutProgramExercise(id: "dead_hang", sets: 2, repMin: 30, repMax: 30, restSeconds: 30, isOptional: false, supersetGroupId: nil, notes: "30 sec hold"),
                    WorkoutProgramExercise(id: "incline_bench", sets: 4, repMin: 8, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "Schedule B: hypertrophy range"),
                    WorkoutProgramExercise(id: "weighted_pullup", sets: 4, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "ohp", sets: 3, repMin: 8, repMax: 10, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "cable_row", sets: 3, repMin: 10, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "barbell_curl", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: "ss_attia_ub1", notes: nil),
                    WorkoutProgramExercise(id: "tricep_pushdown", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: "ss_attia_ub1", notes: nil),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 2, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks")
                ]
            ),
            // Lower B: Hypertrophy
            WorkoutProgramDay(
                id: "attia_lower_b",
                label: "Lower Hypertrophy",
                muscleGroups: ["Quads", "Glutes", "Hamstrings", "Core"],
                exercises: [
                    WorkoutProgramExercise(id: "bird_dog", sets: 2, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "mcgill_curlup", sets: 2, repMin: 6, repMax: 6, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "side_plank", sets: 2, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "20 sec per side"),
                    WorkoutProgramExercise(id: "front_squat", sets: 4, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "rdl", sets: 3, repMin: 10, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "hip_thrust", sets: 3, repMin: 10, repMax: 15, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "walking_lunge", sets: 3, repMin: 12, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "Per side — unilateral balance work"),
                    WorkoutProgramExercise(id: "hanging_knee_raise", sets: 3, repMin: 12, repMax: 15, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 2, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks")
                ]
            )
        ],
        progressionScheme: .doubleProgression
    )

    // MARK: - C) Huberman Weekly Protocol (5 days/week, Intermediate)
    // Huberman's 7-day template compressed to 5 training days
    // 3 resistance + 1 power/conditioning + 1 arms/accessories
    // Monthly A/B periodization: Schedule A (4-8 reps) / Schedule B (8-15 reps)

    static let hubermanWeekly = WorkoutProgram(
        id: "huberman_weekly_5day",
        name: "Huberman Weekly Protocol",
        shortDescription: "Huberman's research-backed weekly template with monthly A/B periodization and power preservation.",
        description: "Based on Andrew Huberman's Foundational Fitness Protocol and his collaboration with exercise scientist Andy Galpin. Three resistance days (legs, torso, arms), one power/conditioning day (kettlebell swings + med ball work), and note-based cardio guidance. Alternate monthly between Schedule A (4-8 reps, 3-4 sets, strength focus) and Schedule B (8-15 reps, 2-3 sets, hypertrophy focus). Sessions stay under 75 minutes to manage cortisol. Use the physiological sigh between sets: two inhales through nose, one exhale through mouth.",
        daysPerWeek: 5,
        difficulty: "Intermediate",
        focus: "Hypertrophy",
        days: [
            // Day 1: Legs
            WorkoutProgramDay(
                id: "hub_legs",
                label: "Legs",
                muscleGroups: ["Quads", "Glutes", "Hamstrings", "Calves"],
                exercises: [
                    WorkoutProgramExercise(id: "bird_dog", sets: 2, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Quick stability warmup"),
                    WorkoutProgramExercise(id: "side_plank", sets: 2, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "20 sec per side"),
                    WorkoutProgramExercise(id: "back_squat", sets: 4, repMin: 4, repMax: 8, restSeconds: 150, isOptional: false, supersetGroupId: nil, notes: "Schedule A: 4-6 reps / Schedule B: 8-12 reps"),
                    WorkoutProgramExercise(id: "rdl", sets: 3, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "leg_press", sets: 3, repMin: 10, repMax: 12, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "leg_curl", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "calf_raise", sets: 4, repMin: 12, repMax: 15, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: nil)
                ]
            ),
            // Day 2: Torso Push & Pull
            WorkoutProgramDay(
                id: "hub_torso",
                label: "Torso Push & Pull",
                muscleGroups: ["Chest", "Back", "Shoulders"],
                exercises: [
                    WorkoutProgramExercise(id: "bird_dog", sets: 2, repMin: 8, repMax: 8, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "Stability warmup"),
                    WorkoutProgramExercise(id: "side_plank", sets: 2, repMin: 20, repMax: 20, restSeconds: 20, isOptional: false, supersetGroupId: nil, notes: "20 sec per side"),
                    WorkoutProgramExercise(id: "bench_press", sets: 4, repMin: 4, repMax: 8, restSeconds: 150, isOptional: false, supersetGroupId: nil, notes: "Schedule A: 4-6 reps / Schedule B: 8-12 reps"),
                    WorkoutProgramExercise(id: "barbell_row", sets: 4, repMin: 6, repMax: 8, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "incline_db_press", sets: 3, repMin: 8, repMax: 12, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "weighted_pullup", sets: 3, repMin: 6, repMax: 8, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "face_pull", sets: 3, repMin: 12, repMax: 15, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Shoulder health"),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 2, repMin: 1, repMax: 1, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "40m walks")
                ]
            ),
            // Day 3: Power & Conditioning
            WorkoutProgramDay(
                id: "hub_power",
                label: "Power & Conditioning",
                muscleGroups: ["Glutes", "Core", "Power"],
                exercises: [
                    WorkoutProgramExercise(id: "kettlebell_swing", sets: 5, repMin: 10, repMax: 10, restSeconds: 90, isOptional: false, supersetGroupId: nil, notes: "Explosive hip drive — power preservation for aging"),
                    WorkoutProgramExercise(id: "med_ball_slam", sets: 3, repMin: 8, repMax: 10, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Full-body power — fast-twitch fiber maintenance"),
                    WorkoutProgramExercise(id: "goblet_squat", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Active recovery between power sets"),
                    WorkoutProgramExercise(id: "pallof_press", sets: 3, repMin: 12, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Anti-rotation core work")
                ]
            ),
            // Day 4: Arms & Accessories
            WorkoutProgramDay(
                id: "hub_arms",
                label: "Arms & Accessories",
                muscleGroups: ["Biceps", "Triceps", "Shoulders", "Core"],
                exercises: [
                    WorkoutProgramExercise(id: "barbell_curl", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: "ss_hub_arms1", notes: nil),
                    WorkoutProgramExercise(id: "tricep_pushdown", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: "ss_hub_arms1", notes: nil),
                    WorkoutProgramExercise(id: "hammer_curl", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: "ss_hub_arms2", notes: nil),
                    WorkoutProgramExercise(id: "overhead_tricep_ext", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: "ss_hub_arms2", notes: nil),
                    WorkoutProgramExercise(id: "lateral_raise", sets: 3, repMin: 12, repMax: 15, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "pallof_press", sets: 3, repMin: 12, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "dead_hang", sets: 3, repMin: 30, repMax: 60, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Longevity benchmark: work toward 2 minutes")
                ]
            ),
            // Day 5: Zone 2 + VO2max guidance
            WorkoutProgramDay(
                id: "hub_cardio",
                label: "Cardio Day",
                muscleGroups: ["Cardio"],
                exercises: [
                    WorkoutProgramExercise(id: "wall_sit", sets: 3, repMin: 45, repMax: 60, restSeconds: 60, isOptional: true, supersetGroupId: nil, notes: "Optional: isometric leg endurance. Log Zone 2 cardio (30-60 min) and any VO2max intervals (4 min on / 4 min off × 4-6 rounds) in the Cardio tab.")
                ]
            )
        ],
        progressionScheme: .undulating
    )

    // MARK: - D) Starting Strength NLP (3 days/week, Beginner)
    // Rippetoe's proven novice linear progression
    // Workout A: Squat / Press / Deadlift
    // Workout B: Squat / Bench / Deadlift
    // Add weight every single session

    static let startingStrength = WorkoutProgram(
        id: "starting_strength_3day",
        name: "Starting Strength",
        shortDescription: "Rippetoe's proven novice linear progression. Squat every session, add weight every workout.",
        description: "Mark Rippetoe's Starting Strength is the most systematized novice barbell program ever published. Built on one principle: untrained individuals can add weight every 48-72 hours. Two alternating workouts, three days per week, using only compound barbell movements that train the most muscle mass across the longest range of motion with the heaviest loads. Add 5-10 lbs per session on squats and deadlifts, 5 lbs on presses. Simple, brutal, effective. As Rippetoe says: 'Strong people are harder to kill than weak people and more useful in general.'",
        daysPerWeek: 3,
        difficulty: "Beginner",
        focus: "Strength",
        days: [
            // Workout A
            WorkoutProgramDay(
                id: "ss_workout_a",
                label: "Workout A",
                muscleGroups: ["Quads", "Shoulders", "Back", "Glutes"],
                exercises: [
                    WorkoutProgramExercise(id: "back_squat", sets: 3, repMin: 5, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "Add 5 lbs every session"),
                    WorkoutProgramExercise(id: "ohp", sets: 3, repMin: 5, repMax: 5, restSeconds: 180, isOptional: false, supersetGroupId: nil, notes: "Add 5 lbs every session"),
                    WorkoutProgramExercise(id: "deadlift", sets: 1, repMin: 5, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "One heavy set of 5. Add 10 lbs every session")
                ]
            ),
            // Workout B
            WorkoutProgramDay(
                id: "ss_workout_b",
                label: "Workout B",
                muscleGroups: ["Quads", "Chest", "Back", "Glutes"],
                exercises: [
                    WorkoutProgramExercise(id: "back_squat", sets: 3, repMin: 5, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "Add 5 lbs every session"),
                    WorkoutProgramExercise(id: "bench_press", sets: 3, repMin: 5, repMax: 5, restSeconds: 180, isOptional: false, supersetGroupId: nil, notes: "Add 5 lbs every session"),
                    WorkoutProgramExercise(id: "deadlift", sets: 1, repMin: 5, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "One heavy set of 5. Add 10 lbs every session")
                ]
            )
        ],
        progressionScheme: .linearProgression
    )

    // MARK: - E) Simple & Sinister (6 days/week, Beginner)
    // Pavel Tsatsouline's minimalist kettlebell program
    // 100 one-arm swings (10×10) + 10 Turkish get-ups (10×1)
    // ~20 minutes per session, 6 days per week

    static let simpleSinister = WorkoutProgram(
        id: "simple_sinister_6day",
        name: "Simple & Sinister",
        shortDescription: "Pavel's minimalist masterpiece: 100 swings and 10 get-ups in under 20 minutes, 6 days a week.",
        description: "Pavel Tsatsouline's Simple & Sinister treats strength as a skill to be practiced, not a capacity to be exhausted. The program is two exercises: 100 one-arm kettlebell swings (10 sets of 10) and 10 Turkish get-ups (alternating sides). Together they train the hinge pattern, grip, core stability, shoulder health, and whole-body coordination. The 'Simple' standard is a 32 kg bell for men, 24 kg for women. Anti-glycolytic by design — you should feel energized after each session, not destroyed. The most time-efficient full-body training protocol that preserves both strength and power.",
        daysPerWeek: 6,
        difficulty: "Beginner",
        focus: "Longevity",
        days: [
            WorkoutProgramDay(
                id: "sns_practice",
                label: "Swings & Get-Ups",
                muscleGroups: ["Glutes", "Hamstrings", "Core", "Shoulders"],
                exercises: [
                    // Warmup
                    WorkoutProgramExercise(id: "bird_dog", sets: 3, repMin: 5, repMax: 5, restSeconds: 15, isOptional: false, supersetGroupId: nil, notes: "Quick spinal warmup"),
                    WorkoutProgramExercise(id: "goblet_squat", sets: 3, repMin: 5, repMax: 5, restSeconds: 30, isOptional: false, supersetGroupId: nil, notes: "Prying goblet squat — hip mobility warmup"),
                    // Main work
                    WorkoutProgramExercise(id: "kettlebell_swing", sets: 10, repMin: 10, repMax: 10, restSeconds: 30, isOptional: false, supersetGroupId: nil, notes: "One-arm swings. Target: all 100 reps in 5 minutes. Simple standard: 32 kg (men) / 24 kg (women)"),
                    WorkoutProgramExercise(id: "turkish_getup", sets: 10, repMin: 1, repMax: 1, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Alternate sides each rep. Target: 10 in 10 minutes. Simple standard: 32 kg (men) / 24 kg (women)")
                ]
            )
        ],
        progressionScheme: .linearProgression
    )

    // MARK: - F) Strength Focus (4 days/week, Advanced)
    // Heavy compounds in 3-5 rep range with extended rest
    // For experienced lifters pushing maximal strength

    static let strengthFocus = WorkoutProgram(
        id: "strength_4day",
        name: "Strength Focus",
        shortDescription: "Heavy compound lifts with low reps and long rest for maximal strength gains.",
        description: "This program prioritizes absolute strength through heavy compounds in the 3-5 rep range with extended rest periods. Each session is built around one or two main lifts followed by targeted accessories to address weaknesses. Designed for experienced lifters who have a solid technical foundation and want to push their 1RM potential.",
        daysPerWeek: 4,
        difficulty: "Advanced",
        focus: "Strength",
        days: [
            // Day 1: Squat Focus
            WorkoutProgramDay(
                id: "str_squat",
                label: "Squat Day",
                muscleGroups: ["Quads", "Glutes", "Core"],
                exercises: [
                    WorkoutProgramExercise(id: "back_squat", sets: 5, repMin: 3, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "Main lift - work up to top set"),
                    WorkoutProgramExercise(id: "front_squat", sets: 3, repMin: 5, repMax: 6, restSeconds: 180, isOptional: false, supersetGroupId: nil, notes: "Supplemental quad work"),
                    WorkoutProgramExercise(id: "leg_press", sets: 3, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "leg_curl", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "calf_raise", sets: 4, repMin: 12, repMax: 15, restSeconds: 60, isOptional: true, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "pallof_press", sets: 3, repMin: 12, repMax: 12, restSeconds: 60, isOptional: true, supersetGroupId: nil, notes: nil)
                ]
            ),
            // Day 2: Bench Focus
            WorkoutProgramDay(
                id: "str_bench",
                label: "Bench Day",
                muscleGroups: ["Chest", "Shoulders", "Triceps"],
                exercises: [
                    WorkoutProgramExercise(id: "bench_press", sets: 5, repMin: 3, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "Main lift - work up to top set"),
                    WorkoutProgramExercise(id: "incline_bench", sets: 3, repMin: 6, repMax: 8, restSeconds: 180, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "ohp", sets: 3, repMin: 6, repMax: 8, restSeconds: 150, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "tricep_pushdown", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "lateral_raise", sets: 3, repMin: 12, repMax: 15, restSeconds: 60, isOptional: true, supersetGroupId: nil, notes: nil)
                ]
            ),
            // Day 3: Deadlift Focus
            WorkoutProgramDay(
                id: "str_deadlift",
                label: "Deadlift Day",
                muscleGroups: ["Back", "Hamstrings", "Glutes"],
                exercises: [
                    WorkoutProgramExercise(id: "trap_bar_deadlift", sets: 5, repMin: 3, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "Main lift - work up to top set"),
                    WorkoutProgramExercise(id: "rdl", sets: 3, repMin: 6, repMax: 8, restSeconds: 180, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "barbell_row", sets: 4, repMin: 6, repMax: 8, restSeconds: 150, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "weighted_pullup", sets: 3, repMin: 5, repMax: 8, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "farmer_carry", sets: 3, repMin: 1, repMax: 1, restSeconds: 90, isOptional: true, supersetGroupId: nil, notes: "40m walks for grip strength"),
                    WorkoutProgramExercise(id: "hanging_knee_raise", sets: 3, repMin: 12, repMax: 15, restSeconds: 60, isOptional: true, supersetGroupId: nil, notes: nil)
                ]
            ),
            // Day 4: OHP / Upper Focus
            WorkoutProgramDay(
                id: "str_ohp",
                label: "OHP Day",
                muscleGroups: ["Shoulders", "Chest", "Back", "Arms"],
                exercises: [
                    WorkoutProgramExercise(id: "ohp", sets: 5, repMin: 3, repMax: 5, restSeconds: 240, isOptional: false, supersetGroupId: nil, notes: "Main lift - work up to top set"),
                    WorkoutProgramExercise(id: "incline_db_press", sets: 3, repMin: 8, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "pullup", sets: 4, repMin: 6, repMax: 10, restSeconds: 120, isOptional: false, supersetGroupId: nil, notes: nil),
                    WorkoutProgramExercise(id: "barbell_curl", sets: 3, repMin: 8, repMax: 10, restSeconds: 60, isOptional: false, supersetGroupId: "ss_str_d4", notes: nil),
                    WorkoutProgramExercise(id: "overhead_tricep_ext", sets: 3, repMin: 10, repMax: 12, restSeconds: 60, isOptional: false, supersetGroupId: "ss_str_d4", notes: nil),
                    WorkoutProgramExercise(id: "face_pull", sets: 3, repMin: 15, repMax: 20, restSeconds: 60, isOptional: false, supersetGroupId: nil, notes: "Shoulder health")
                ]
            )
        ],
        progressionScheme: .linearProgression
    )
}
