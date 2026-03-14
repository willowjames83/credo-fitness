import Foundation
import SwiftUI

@Observable
class CardioViewModel {
    let store = CardioStore.shared

    var isSessionActive = false
    var activeSessionType: CardioType = .running
    var elapsedSeconds: Int = 0
    var activeDistanceMeters: Double?
    var activeNotes: String = ""

    private var timer: Timer?

    // MARK: - Computed Properties

    var sessions: [CardioSession] {
        store.cardioSessions.sorted { $0.date > $1.date }
    }

    var recentSessions: [CardioSession] {
        Array(sessions.prefix(5))
    }

    var weeklyStats: WeeklyCardioStats {
        let thisWeek = store.sessionsThisWeek()
        return WeeklyCardioStats(
            totalMinutes: store.weeklyCardioMinutes(),
            sessionCount: thisWeek.count,
            averageDuration: store.averageSessionDuration(),
            zone2PlusMinutes: store.weeklyZone2PlusMinutes()
        )
    }

    var cardioScore: Int {
        CardioScoreCalculator.calculate(store: store)
    }

    var formattedElapsedTime: String {
        let minutes = elapsedSeconds / 60
        let seconds = elapsedSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }

    // MARK: - Session Management

    func startSession(type: CardioType) {
        activeSessionType = type
        elapsedSeconds = 0
        activeDistanceMeters = nil
        activeNotes = ""
        isSessionActive = true
        startTimer()
    }

    func stopSession() {
        stopTimer()
        isSessionActive = false

        let session = CardioSession(
            type: activeSessionType,
            distanceMeters: activeDistanceMeters,
            durationSeconds: elapsedSeconds,
            date: Date(),
            notes: activeNotes.isEmpty ? nil : activeNotes
        )

        store.addSession(session)
        elapsedSeconds = 0
    }

    func cancelSession() {
        stopTimer()
        isSessionActive = false
        elapsedSeconds = 0
    }

    func deleteSession(_ session: CardioSession) {
        store.deleteSession(session)
    }

    func deleteSession(at offsets: IndexSet) {
        store.deleteSession(at: offsets, from: sessions)
    }

    // MARK: - Timer

    private func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self else { return }
            self.elapsedSeconds += 1
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    deinit {
        timer?.invalidate()
    }
}

struct WeeklyCardioStats {
    let totalMinutes: Int
    let sessionCount: Int
    let averageDuration: Int
    let zone2PlusMinutes: Int
}
