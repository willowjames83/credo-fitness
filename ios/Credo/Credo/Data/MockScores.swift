import Foundation

let mockCredoScore = CredoScore(score: 72, delta: 3)

let mockPillarScores: [Pillar: PillarScore] = [
    .strength: PillarScore(score: 68, metrics: ["2 of 3 sessions done", "42,500 lbs total volume"]),
    .stability: PillarScore(score: 41, metrics: ["2 of 3 warmups complete", "Hip mobility focus next"], isWeakest: true),
    .cardio: PillarScore(score: 76, metrics: ["Zone 2: 120 / 180 min", "VO\u{2082} max: 42 ml/kg/min"]),
    .nutrition: PillarScore(score: 85, metrics: ["168g / 180g protein today", "5 of 7 days on target"]),
]

let mockScoreHistory: [ScoreHistoryEntry] = [
    ScoreHistoryEntry(week: 5, credo: 48, strength: 45, stability: 35, cardio: 52, nutrition: 60),
    ScoreHistoryEntry(week: 6, credo: 52, strength: 50, stability: 36, cardio: 55, nutrition: 65),
    ScoreHistoryEntry(week: 7, credo: 55, strength: 53, stability: 38, cardio: 58, nutrition: 70),
    ScoreHistoryEntry(week: 8, credo: 60, strength: 58, stability: 37, cardio: 63, nutrition: 75),
    ScoreHistoryEntry(week: 9, credo: 63, strength: 60, stability: 39, cardio: 68, nutrition: 78),
    ScoreHistoryEntry(week: 10, credo: 66, strength: 63, stability: 40, cardio: 71, nutrition: 80),
    ScoreHistoryEntry(week: 11, credo: 69, strength: 65, stability: 40, cardio: 74, nutrition: 82),
    ScoreHistoryEntry(week: 12, credo: 72, strength: 68, stability: 41, cardio: 76, nutrition: 85),
]
