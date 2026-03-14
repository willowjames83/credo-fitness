import Foundation

@Observable
final class SyncViewModel {
    private let syncService = SyncService.shared

    var syncStatus: SyncStatus {
        syncService.syncStatus
    }

    var lastSyncFormatted: String {
        formatLastSync()
    }

    // MARK: - Actions

    func manualSync() {
        Task { @MainActor in
            await syncService.syncNow()
        }
    }

    // MARK: - Formatting

    func formatLastSync() -> String {
        guard let lastSync = syncService.lastSyncDate else {
            return "Never synced"
        }

        let elapsed = Date().timeIntervalSince(lastSync)

        if elapsed < 60 {
            return "Synced just now"
        } else if elapsed < 3600 {
            let minutes = Int(elapsed / 60)
            return "Synced \(minutes)m ago"
        } else if elapsed < 86400 {
            let hours = Int(elapsed / 3600)
            return "Synced \(hours)h ago"
        } else {
            let days = Int(elapsed / 86400)
            return "Synced \(days)d ago"
        }
    }
}
