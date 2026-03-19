import SwiftUI

struct StabilityDetailView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                StabilityDetailCard()

                VStack(alignment: .leading, spacing: 8) {
                    Text("How It's Calculated")
                        .font(.credoBody(size: 14, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("Your stability score is based on warmup adherence (30%), core training volume (30%), unilateral work (20%), and muscle recovery compliance (20%).")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }
                .padding(16)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CredoColors.border, lineWidth: 1)
                )
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
        .navigationTitle("Stability")
        .navigationBarTitleDisplayMode(.inline)
    }
}
