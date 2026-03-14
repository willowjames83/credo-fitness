import SwiftUI

struct PRShareCard: View {
    let exerciseName: String
    let weight: Double
    let reps: Int
    let estimated1RM: Double
    let date: Date
    let aspectRatio: AspectRatio

    private var isStory: Bool { aspectRatio == .story }
    private let accentColor = CredoColors.accent

    var body: some View {
        ZStack {
            ShareCardBackground(aspectRatio: aspectRatio)

            VStack(spacing: isStory ? 60 : 32) {
                if isStory { Spacer().frame(height: 80) }

                // Credo wordmark
                credoWordmark

                Spacer().frame(height: isStory ? 40 : 16)

                // PR badge
                prBadge

                // Exercise name
                Text(exerciseName.uppercased())
                    .font(.credoDisplay(size: isStory ? 64 : 52))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.7)
                    .padding(.horizontal, 60)

                // Weight x Reps
                weightRepsDisplay

                // Divider line
                Rectangle()
                    .fill(accentColor.opacity(0.4))
                    .frame(width: 200, height: 2)

                // Estimated 1RM
                estimated1RMDisplay

                Spacer()

                // Date
                dateDisplay

                if isStory { Spacer().frame(height: 100) }
            }
            .padding(isStory ? 48 : 40)
        }
        .frame(width: aspectRatio.size.width, height: aspectRatio.size.height)
    }

    // MARK: - Subviews

    private var credoWordmark: some View {
        Text("CREDO")
            .font(.credoDisplay(size: 28))
            .foregroundStyle(.white.opacity(0.6))
            .tracking(8)
    }

    private var prBadge: some View {
        Text("NEW PR")
            .font(.credoMono(size: 18, weight: .bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 24)
            .padding(.vertical, 10)
            .background(
                Capsule()
                    .fill(accentColor)
            )
    }

    private var weightRepsDisplay: some View {
        HStack(alignment: .firstTextBaseline, spacing: 16) {
            Text(formatWeight(weight))
                .font(.credoMono(size: isStory ? 96 : 80, weight: .bold))
                .foregroundStyle(.white)

            Text("\u{00D7}")
                .font(.credoMono(size: isStory ? 48 : 40, weight: .medium))
                .foregroundStyle(accentColor)

            Text("\(reps)")
                .font(.credoMono(size: isStory ? 96 : 80, weight: .bold))
                .foregroundStyle(.white)
        }
    }

    private var estimated1RMDisplay: some View {
        VStack(spacing: 8) {
            Text("ESTIMATED 1RM")
                .font(.credoMono(size: 14, weight: .medium))
                .foregroundStyle(.white.opacity(0.5))
                .tracking(4)

            Text("\(formatWeight(estimated1RM)) lbs")
                .font(.credoMono(size: isStory ? 44 : 36, weight: .bold))
                .foregroundStyle(accentColor)
        }
    }

    private var dateDisplay: some View {
        Text(formattedDate)
            .font(.credoMono(size: 16, weight: .medium))
            .foregroundStyle(.white.opacity(0.4))
            .tracking(2)
    }

    // MARK: - Formatting

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy"
        return formatter.string(from: date).uppercased()
    }

    private func formatWeight(_ value: Double) -> String {
        value.formattedWeight
    }
}

#Preview("Square") {
    PRShareCard(
        exerciseName: "Bench Press",
        weight: 225,
        reps: 5,
        estimated1RM: 253,
        date: Date(),
        aspectRatio: .square
    )
    .scaleEffect(0.3)
}

#Preview("Story") {
    PRShareCard(
        exerciseName: "Bench Press",
        weight: 225,
        reps: 5,
        estimated1RM: 253,
        date: Date(),
        aspectRatio: .story
    )
    .scaleEffect(0.2)
}
