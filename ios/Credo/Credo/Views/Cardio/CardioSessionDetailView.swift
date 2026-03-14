import SwiftUI

struct CardioSessionDetailView: View {
    let session: CardioSession
    @Bindable var vm: CardioViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showDeleteAlert = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header Card
                headerCard

                // Metrics Grid
                metricsGrid

                // Heart Rate Zones
                if let zones = session.heartRateZones, !zones.isEmpty {
                    heartRateZonesCard(zones)
                }

                // Notes
                if let notes = session.notes, !notes.isEmpty {
                    notesCard(notes)
                }

                // Delete Button
                deleteButton
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
        .background(CredoColors.bg)
        .navigationTitle("Session Detail")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Delete Session", isPresented: $showDeleteAlert) {
            Button("Delete", role: .destructive) {
                vm.deleteSession(session)
                dismiss()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to delete this session? This cannot be undone.")
        }
    }

    // MARK: - Header Card

    private var headerCard: some View {
        VStack(spacing: 12) {
            Image(systemName: session.type.icon)
                .font(.system(size: 32, weight: .light))
                .foregroundStyle(CredoColors.cardio)

            Text(session.type.displayName)
                .font(.credoDisplay(size: 22))
                .foregroundStyle(CredoColors.textPrimary)

            Text(formattedFullDate(session.date))
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            Text(session.formattedDuration)
                .font(.credoMono(size: 36, weight: .bold))
                .foregroundStyle(CredoColors.textPrimary)
        }
        .padding(20)
        .frame(maxWidth: .infinity)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    // MARK: - Metrics Grid

    private var metricsGrid: some View {
        let columns = [
            GridItem(.flexible(), spacing: 10),
            GridItem(.flexible(), spacing: 10),
        ]

        return LazyVGrid(columns: columns, spacing: 10) {
            if let miles = session.distanceMiles {
                CardioMetricCard(
                    icon: "location",
                    value: String(format: "%.2f", miles),
                    label: "Miles"
                )
            }

            if let pace = session.pacePerMile {
                CardioMetricCard(
                    icon: "speedometer",
                    value: pace,
                    label: "Pace"
                )
            }

            if let avgHR = session.avgHeartRate {
                CardioMetricCard(
                    icon: "heart",
                    value: "\(avgHR)",
                    label: "Avg HR"
                )
            }

            if let maxHR = session.maxHeartRate {
                CardioMetricCard(
                    icon: "heart.fill",
                    value: "\(maxHR)",
                    label: "Max HR"
                )
            }

            if let calories = session.caloriesBurned {
                CardioMetricCard(
                    icon: "flame",
                    value: "\(calories)",
                    label: "Calories"
                )
            }

            CardioMetricCard(
                icon: "clock",
                value: "\(session.durationMinutes)",
                label: "Minutes"
            )
        }
    }

    // MARK: - Heart Rate Zones

    private func heartRateZonesCard(_ zones: [HeartRateZone]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Heart Rate Zones")
                .font(.credoBody(size: 14, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            HeartRateZoneBar(zones: zones)

            VStack(spacing: 8) {
                ForEach(zones.sorted(by: { $0.zone < $1.zone })) { zone in
                    HStack {
                        Circle()
                            .fill(colorForZone(zone.zone))
                            .frame(width: 8, height: 8)

                        Text("Z\(zone.zone) — \(zone.zoneName)")
                            .font(.credoBody(size: 12, weight: .medium))
                            .foregroundStyle(CredoColors.textPrimary)

                        Spacer()

                        Text("\(zone.durationSeconds / 60) min")
                            .font(.credoMono(size: 12, weight: .medium))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                }
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    // MARK: - Notes

    private func notesCard(_ notes: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Notes")
                .font(.credoBody(size: 14, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            Text(notes)
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    // MARK: - Delete

    private var deleteButton: some View {
        Button {
            showDeleteAlert = true
        } label: {
            Text("Delete Session")
                .font(.credoBody(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.danger)
        }
        .padding(.top, 8)
    }

    // MARK: - Helpers

    private func formattedFullDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d 'at' h:mm a"
        return formatter.string(from: date)
    }

    private func colorForZone(_ zone: Int) -> Color {
        switch zone {
        case 1: return CredoColors.textTertiary
        case 2: return CredoColors.success
        case 3: return CredoColors.warning
        case 4: return CredoColors.accent
        case 5: return CredoColors.danger
        default: return CredoColors.textTertiary
        }
    }
}
