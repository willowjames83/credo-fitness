import SwiftUI

struct CardioHistoryView: View {
    @Bindable var vm: CardioViewModel

    private var groupedSessions: [(String, [CardioSession])] {
        vm.store.sessionsGroupedByWeek()
    }

    var body: some View {
        List {
            if groupedSessions.isEmpty {
                Section {
                    VStack(spacing: 8) {
                        Image(systemName: "heart.circle")
                            .font(.system(size: 28, weight: .light))
                            .foregroundStyle(CredoColors.textTertiary)

                        Text("No sessions recorded")
                            .font(.credoBody(size: 14, weight: .medium))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                    .listRowBackground(Color.clear)
                }
            } else {
                ForEach(groupedSessions, id: \.0) { weekLabel, sessions in
                    Section {
                        ForEach(sessions) { session in
                            NavigationLink {
                                CardioSessionDetailView(session: session, vm: vm)
                            } label: {
                                historyRow(session)
                            }
                        }
                        .onDelete { offsets in
                            let sessionsToDelete = offsets.map { sessions[$0] }
                            for session in sessionsToDelete {
                                vm.deleteSession(session)
                            }
                        }
                    } header: {
                        Text(weekLabel)
                            .font(.credoBody(size: 12, weight: .semibold))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("History")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func historyRow(_ session: CardioSession) -> some View {
        HStack(spacing: 12) {
            Image(systemName: session.type.icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 32, height: 32)
                .background(CredoColors.cardio)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(session.type.displayName)
                    .font(.credoBody(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(formattedDate(session.date))
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(session.formattedDuration)
                    .font(.credoMono(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                if let miles = session.distanceMiles {
                    Text(String(format: "%.1f mi", miles))
                        .font(.credoMono(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
        .padding(.vertical, 2)
    }

    private func formattedDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: date)
    }
}
