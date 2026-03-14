import SwiftUI

struct UpcomingExerciseRow: View {
    let exercise: ActiveExercise

    var body: some View {
        HStack {
            Text(exercise.name)
                .font(.credoBody(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(exercise.setsTarget)
                    .font(.credoBody(size: 13, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
                if !exercise.isBodyweight {
                    Text("\(Int(exercise.recommendedWeight)) lbs")
                        .font(.credoMono(size: 12, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                }
            }

            Image(systemName: "chevron.right")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .padding(14)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
